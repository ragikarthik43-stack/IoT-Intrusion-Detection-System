import time, os, psutil
from pathlib import Path
import joblib, numpy as np, pandas as pd, plotly.express as px, shap, streamlit as st
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

st.set_page_config(page_title="IoT Intrusion Detection System", page_icon="🛡️", layout="wide")

# ---------- login gate ----------
import hmac
DASH_USER = os.environ.get("DASH_USER", "admin")
DASH_PASS = os.environ.get("DASH_PASS", "admin123")

if "authed" not in st.session_state:
    st.session_state["authed"] = False

if not st.session_state["authed"]:
    _, mid, _ = st.columns([1, 1.2, 1])
    with mid:
        st.markdown("## 🛡️ IoT Intrusion Detection System")
        st.caption("Sign in to open the live security dashboard")
        with st.form("login_form"):
            u = st.text_input("Username")
            p = st.text_input("Password", type="password")
            go = st.form_submit_button("Sign in", use_container_width=True)
        if go:
            ok_u = hmac.compare_digest(u.encode(), DASH_USER.encode())
            ok_p = hmac.compare_digest(p.encode(), DASH_PASS.encode())
            if ok_u and ok_p:
                st.session_state["authed"] = True
                st.rerun()
            else:
                st.error("Invalid username or password")
    st.stop()

with st.sidebar:
    if st.button("🚪 Log out", use_container_width=True):
        st.session_state["authed"] = False
        st.rerun()
HERE = Path(__file__).parent
DROP = ['ts', 'src_ip', 'dst_ip', 'src_port', 'dst_port', 'label', 'type']

# ---------- load model + traffic ----------
@st.cache_resource
def load_model():
    b = joblib.load(HERE / 'ids_lightgbm.pkl')
    b['maps'] = {c: {v: i for i, v in enumerate(e.classes_)} for c, e in b['encoders'].items()}
    b['explainer'] = shap.TreeExplainer(b['model'])
    return b

@st.cache_data
def load_traffic(enc_cols):
    df = pd.read_csv(HERE / 'test_traffic.csv', dtype={c: str for c in enc_cols}, low_memory=False)
    return df.sample(frac=1, random_state=7).reset_index(drop=True)

b = load_model()
CLASSES = list(b['classes'])
traffic = load_traffic(tuple(b['encoders']))

def preprocess(rows):
    X = rows.drop(columns=[c for c in DROP if c in rows.columns]).copy()
    for c, m in b['maps'].items():
        X[c] = X[c].astype(str).map(m).fillna(-1)
    X = X.apply(pd.to_numeric, errors='coerce').fillna(0)
    return X[b['features']]

# ---------- state ----------
ss = st.session_state
for k, v in {'ptr': 0, 'running': False, 'log': [], 'blocked': {}, 'lat': []}.items():
    if k not in ss:
        ss[k] = v

def set_action(i, action):
    for e in ss.log:
        if e['id'] == i and e['action'] == 'Pending review':
            e['action'] = action

# ---------- sidebar ----------
with st.sidebar:
    st.title("🛡️ IDS Control")
    c1, c2 = st.columns(2)
    if c1.button("▶ Start"):
        ss.running = True
    if c2.button("⏸ Pause"):
        ss.running = False
    if st.button("🔄 Reset"):
        ss.ptr, ss.running, ss.log, ss.blocked, ss.lat = 0, False, [], {}, []
    batch = st.slider("Packets per update", 5, 200, 25)
    delay = st.slider("Update interval (seconds)", 0.5, 5.0, 1.0)
    st.subheader("Security response")
    attack_classes = [c for c in CLASSES if c != 'normal']
    auto_cls = st.multiselect("Auto-block these attacks", attack_classes,
                              default=[c for c in ['ddos', 'dos', 'ransomware', 'backdoor'] if c in CLASSES])
    st.caption("All other attacks wait for manual review.")
    st.divider()
    st.caption(f"Model: LightGBM (10 classes) · replaying {len(traffic):,} TON_IoT test flows")
    st.progress(min(ss.ptr / len(traffic), 1.0))

# ---------- process next batch ----------
def process(n):
    rows = traffic.iloc[ss.ptr: ss.ptr + n]
    if rows.empty:
        ss.running = False
        return
    t0 = time.perf_counter()
    proba = b['model'].predict_proba(preprocess(rows))
    ss.lat.append((time.perf_counter() - t0) * 1000 / len(rows))
    now = time.strftime('%H:%M:%S')
    for i, (idx, r) in enumerate(rows.iterrows()):
        k = int(proba[i].argmax()); pred = CLASSES[k]; ip = str(r['src_ip'])
        if ip in ss.blocked:
            action = 'Dropped (IP blocked)'
        elif pred == 'normal':
            action = 'Allowed'
        elif pred in auto_cls:
            action = 'Auto-blocked'; ss.blocked[ip] = f'Auto: {pred}'
        else:
            action = 'Pending review'
        ss.log.append(dict(id=int(idx), time=now, src_ip=ip, dst_ip=str(r['dst_ip']),
                           proto=r['proto'], service=r['service'], prediction=pred,
                           confidence=round(float(proba[i, k]), 3), actual=r['type'], action=action))
    ss.ptr += len(rows)

if ss.running:
    process(batch)
log = pd.DataFrame(ss.log)

# ---------- header ----------
st.title("🛡️ Lightweight ML Intrusion Detection for IoT/IIoT")
st.caption("LightGBM trained on TON_IoT · live traffic replay · SHAP explanations · automatic & manual response")
if log.empty:
    st.info("Press ▶ Start in the sidebar to begin analysing traffic.")
    st.stop()

attacks = log[log['prediction'] != 'normal']
m = st.columns(5)
m[0].metric("Total traffic analysed", f"{len(log):,}")
m[1].metric("Normal", f"{(log['prediction'] == 'normal').sum():,}")
m[2].metric("Attacks detected", f"{len(attacks):,}")
m[3].metric("Blocked IPs", len(ss.blocked))
m[4].metric("Pending review", int((log['action'] == 'Pending review').sum()))

tab1, tab2, tab3, tab4, tab5 = st.tabs(
    ["📊 Live Traffic", "🚨 Alerts & Response", "🧠 Explainable AI", "📈 Performance", "🔧 Edge Model"])

# ---------- tab 1: live traffic ----------
with tab1:
    c1, c2 = st.columns(2)
    if not attacks.empty:
        cnt = attacks['prediction'].value_counts().reset_index()
        cnt.columns = ['attack', 'count']
        c1.plotly_chart(px.bar(cnt, x='attack', y='count', color='attack', title='Attack classification'))
    split = log['prediction'].eq('normal').map({True: 'Normal', False: 'Attack'}).value_counts().reset_index()
    split.columns = ['type', 'count']
    c2.plotly_chart(px.pie(split, names='type', values='count', hole=0.5, title='Normal vs attack',
                           color='type', color_discrete_map={'Normal': '#2ecc71', 'Attack': '#e74c3c'}))
    st.subheader("Live feed (latest 20)")
    st.dataframe(log.tail(20).iloc[::-1], hide_index=True)

# ---------- tab 2: alerts & response ----------
with tab2:
    st.subheader("⏳ Waiting for manual decision")
    pending = log[log['action'] == 'Pending review'].tail(10).iloc[::-1]
    if pending.empty:
        st.success("No alerts waiting for review.")
    for _, a in pending.iterrows():
        c = st.columns([3, 2, 2, 1, 1])
        c[0].write(f"**{a['prediction'].upper()}** from `{a['src_ip']}` → `{a['dst_ip']}`")
        c[1].write(f"Confidence: {a['confidence']:.0%}")
        c[2].write(f"{a['time']} · {a['proto']}/{a['service']}")
        if c[3].button("🚫 Block", key=f"b{a['id']}"):
            ss.blocked[a['src_ip']] = f"Manual: {a['prediction']}"
            set_action(a['id'], 'Manually blocked'); st.rerun()
        if c[4].button("✅ Allow", key=f"a{a['id']}"):
            set_action(a['id'], 'Allowed by admin'); st.rerun()
    st.subheader("🚫 Blocked IPs")
    if ss.blocked:
        st.dataframe(pd.DataFrame(list(ss.blocked.items()), columns=['IP', 'Reason']), hide_index=True)
        if st.button("Unblock all"):
            ss.blocked = {}; st.rerun()
    else:
        st.caption("None yet.")

# ---------- tab 3: explainable AI ----------
with tab3:
    st.subheader("Why did the model flag this traffic?")
    st.caption("Tip: pause the stream first so the list stops changing.")
    recent = attacks.tail(50).iloc[::-1]
    if recent.empty:
        st.info("No attacks detected yet.")
    else:
        labels = {r['id']: f"#{r['id']} · {r['prediction']} from {r['src_ip']} ({r['confidence']:.0%})"
                  for _, r in recent.iterrows()}
        choice = st.selectbox("Pick an alert", list(labels), format_func=labels.get)
        pred = recent.set_index('id').loc[choice, 'prediction']
        k = CLASSES.index(pred)
        X = preprocess(traffic.loc[[choice]])
        sv = b['explainer'].shap_values(X)
        vals = sv[k][0] if isinstance(sv, list) else (sv[0, :, k] if np.ndim(sv) == 3 else sv[0])
        top = pd.DataFrame({'feature': b['features'], 'impact': vals, 'value': X.iloc[0].values})
        top = top.reindex(top['impact'].abs().sort_values(ascending=False).index).head(10).iloc[::-1]
        top['direction'] = np.where(top['impact'] > 0, f'towards {pred}', f'away from {pred}')
        fig = px.bar(top, x='impact', y='feature', orientation='h', color='direction', hover_data=['value'],
                     title=f"Top 10 features behind the '{pred}' prediction")
        st.plotly_chart(fig)
        st.caption("Longer bars = bigger influence on this decision (SHAP values).")

# ---------- tab 4: performance ----------
with tab4:
    st.subheader("Live performance on replayed traffic")
    yt, yp = log['actual'], log['prediction']
    c = st.columns(5)
    c[0].metric("Accuracy", f"{accuracy_score(yt, yp):.4f}")
    c[1].metric("Precision (macro)", f"{precision_score(yt, yp, average='macro', zero_division=0):.4f}")
    c[2].metric("Recall (macro)", f"{recall_score(yt, yp, average='macro', zero_division=0):.4f}")
    c[3].metric("F1 (macro)", f"{f1_score(yt, yp, average='macro', zero_division=0):.4f}")
    is_normal = yt == 'normal'
    fpr = ((yp != 'normal') & is_normal).sum() / max(is_normal.sum(), 1)
    c[4].metric("False positive rate", f"{fpr:.4f}")
    cm = pd.crosstab(yt, yp).reindex(index=CLASSES, columns=CLASSES, fill_value=0)
    st.plotly_chart(px.imshow(cm, text_auto=True, color_continuous_scale='Blues',
                              labels=dict(x='Predicted', y='Actual', color='Flows'), title='Confusion matrix'))

# ---------- tab 5: edge model / base paper ----------
with tab5:
    st.subheader("Resource usage (live)")
    r = st.columns(4)
    r[0].metric("LightGBM model size", f"{os.path.getsize(HERE / 'ids_lightgbm.pkl') / 1024 / 1024:.1f} MB")
    r[1].metric("INT8 TFLite size", f"{os.path.getsize(HERE / 'ids_mlp_int8.tflite') / 1024:.1f} KB")
    r[2].metric("Dashboard RAM usage", f"{psutil.Process().memory_info().rss / 1024 / 1024:.0f} MB")
    r[3].metric("Avg latency per flow", f"{np.mean(ss.lat):.3f} ms" if ss.lat else "—")

    st.subheader("Base-paper reproduction (our Colab results)")
    st.dataframe(pd.DataFrame([
        ['LightGBM', 0.9991, 0.9800, 0.9564],
        ['XGBoost', 0.9991, 0.9802, 0.9584],
        ['Random Forest', 0.9990, 0.9783, 0.9544],
        ['MLP', 0.9961, 0.8481, 0.7985],
        ['Decision Tree (depth 5)', 0.9951, 0.8498, 0.7710],
        ['Logistic Regression', 0.9704, 0.6282, 0.5310],
    ], columns=['Model', 'Binary F1', '10-class accuracy', '10-class F1 (macro)']), hide_index=True)
    st.subheader("INT8 quantization (TensorFlow Lite)")
    q = pd.DataFrame({'Model': ['FP32 MLP', 'INT8 MLP'], 'Size (KB)': [21.36, 10.10], 'Accuracy': [0.965, 0.956]})
    c1, c2 = st.columns(2)
    c1.plotly_chart(px.bar(q, x='Model', y='Size (KB)', color='Model', title='Model size'))
    c2.plotly_chart(px.bar(q, x='Model', y='Accuracy', color='Model', range_y=[0.9, 1.0], title='Accuracy'))
    st.success("ids_mlp_int8.tflite (10 KB) is small enough for ESP32-C3 / Arduino via TensorFlow Lite Micro.")

# ---------- keep streaming ----------
if ss.running:
    time.sleep(delay)
    st.rerun()
