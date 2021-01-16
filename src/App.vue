<template>
  <section id="app" class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autocomplete="off"
        autofocus
        v-model="inputContent"
        @keyup.enter="addTodo"
        >
    </header>
    <section class="main">
      <input type="checkbox" id="toggle-all" class="toggle-all">
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li v-for="(todo, index) in todos" :key="todo.text">
          <div class="view">
            <input type="checkbox" class="toggle">
            <label>{{ todo.text }}</label>
            <button class="destroy" @click="removeTodo(todo, index)"></button>
          </div>
          <input type="text" class="edit">
        </li>
      </ul>
    </section>
    <footer class="footer">
      <span class="todo-count">
        <strong>1</strong> item left
      </span>
      <ul class="filters">
        <li><a href="#/all">All</a></li>
        <li><a href="#/active">Active</a></li>
        <li><a href="#/completed">Completed</a></li>
      </ul>
      <button class="clear-completed">
        Clear completed
      </button>
    </footer>
  </section>
  <footer class="info">
    <p>Double-click to edit a todo</p>
    <p>Written by <a href="http://evanyou.me">Evan You</a></p>
    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
  </footer>
</template>

<script>
import { ref } from 'vue'
import './assets/index.css'
// 为了代码的可维护性，把每一个逻辑都封装到一个独立的函数中
// 1. 添加待办事项
const useAdd = (todos) => {
  // 创建一个响应式的字符串：用户输入的内容
  const inputContent = ref('')
  const addTodo = () => {
    const text = inputContent.value && inputContent.value.trim()
    if (text.length === 0) return
    todos.value.unshift({
      text,
      completed: false
    })
    // 回车之后，清空用户输入的内容
    inputContent.value = ''
  }
  return {
    inputContent,
    addTodo
  }
}

// 2. 删除待办事项
const useRemove = (todos) => {
  const removeTodo = (todo) => {
    // 直接用传入的 index 索引
    // todos.value.splice(index, 1)
    // 或者使用 indexOf 查找 todo 在 todos 中的索引
    const index2 = todos.value.indexOf(todo)
    todos.value.splice(index2, 1)
  }
  return {
    removeTodo
  }
}

// 3. 编辑待办项


export default {
  name: 'App',
  setup() {
    // 创建一个响应式的 空数组，用来存放用户所有的待办事项
    const todos = ref([])
    return {
      todos,
      // 调用 方法 并解构
      ...useAdd(todos),
      ...useRemove(todos)
    }
  }
}
</script>

<style>
</style>