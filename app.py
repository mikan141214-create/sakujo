import streamlit as st
from datetime import datetime

# ページ設定
st.set_page_config(
    page_title="Todo アプリ",
    page_icon="✅",
    layout="centered"
)

# セッション状態の初期化
if 'todos' not in st.session_state:
    st.session_state.todos = []

def add_todo(task):
    """新しいTodoを追加"""
    if task:
        todo = {
            'id': len(st.session_state.todos),
            'task': task,
            'completed': False,
            'created_at': datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        st.session_state.todos.append(todo)

def toggle_todo(todo_id):
    """Todoの完了状態を切り替え"""
    for todo in st.session_state.todos:
        if todo['id'] == todo_id:
            todo['completed'] = not todo['completed']
            break

def delete_todo(todo_id):
    """Todoを削除"""
    st.session_state.todos = [todo for todo in st.session_state.todos if todo['id'] != todo_id]

def delete_completed():
    """完了したTodoをすべて削除"""
    st.session_state.todos = [todo for todo in st.session_state.todos if not todo['completed']]

# メインUI
st.title("✅ Todo アプリ")
st.markdown("---")

# Todoの追加
with st.form("add_todo_form", clear_on_submit=True):
    col1, col2 = st.columns([4, 1])
    with col1:
        new_task = st.text_input("新しいタスクを入力", placeholder="例: 買い物に行く", label_visibility="collapsed")
    with col2:
        submit_button = st.form_submit_button("追加", use_container_width=True)

    if submit_button:
        if new_task.strip():
            add_todo(new_task)
            st.success(f"「{new_task}」を追加しました！")
        else:
            st.error("タスクを入力してください")

st.markdown("---")

# 統計情報
total_todos = len(st.session_state.todos)
completed_todos = sum(1 for todo in st.session_state.todos if todo['completed'])
pending_todos = total_todos - completed_todos

col1, col2, col3 = st.columns(3)
with col1:
    st.metric("全タスク", total_todos)
with col2:
    st.metric("完了", completed_todos)
with col3:
    st.metric("未完了", pending_todos)

st.markdown("---")

# Todoリスト表示
if st.session_state.todos:
    st.subheader("📝 タスク一覧")

    # フィルター
    filter_option = st.radio(
        "表示フィルター",
        ["すべて", "未完了のみ", "完了済みのみ"],
        horizontal=True
    )

    # フィルタリング
    filtered_todos = st.session_state.todos
    if filter_option == "未完了のみ":
        filtered_todos = [todo for todo in st.session_state.todos if not todo['completed']]
    elif filter_option == "完了済みのみ":
        filtered_todos = [todo for todo in st.session_state.todos if todo['completed']]

    if filtered_todos:
        for todo in filtered_todos:
            col1, col2, col3 = st.columns([0.5, 3.5, 1])

            with col1:
                # 完了チェックボックス
                checked = st.checkbox(
                    "完了",
                    value=todo['completed'],
                    key=f"check_{todo['id']}",
                    label_visibility="collapsed"
                )
                if checked != todo['completed']:
                    toggle_todo(todo['id'])
                    st.rerun()

            with col2:
                # タスク内容
                if todo['completed']:
                    st.markdown(f"~~{todo['task']}~~")
                    st.caption(f"作成日時: {todo['created_at']}")
                else:
                    st.markdown(f"**{todo['task']}**")
                    st.caption(f"作成日時: {todo['created_at']}")

            with col3:
                # 削除ボタン
                if st.button("🗑️", key=f"delete_{todo['id']}", use_container_width=True):
                    delete_todo(todo['id'])
                    st.rerun()

            st.markdown("---")
    else:
        st.info(f"「{filter_option}」に該当するタスクはありません")

    # 一括操作
    st.markdown("### 一括操作")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("✨ 完了済みを削除", use_container_width=True):
            if completed_todos > 0:
                delete_completed()
                st.success("完了済みのタスクを削除しました")
                st.rerun()
            else:
                st.warning("完了済みのタスクがありません")
    with col2:
        if st.button("🗑️ すべて削除", use_container_width=True):
            if total_todos > 0:
                st.session_state.todos = []
                st.success("すべてのタスクを削除しました")
                st.rerun()
            else:
                st.warning("削除するタスクがありません")
else:
    st.info("👆 上のフォームから新しいタスクを追加してください")

# フッター
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: gray;'>Made with ❤️ using Streamlit</div>",
    unsafe_allow_html=True
)
