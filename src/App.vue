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
      <!-- allDone 是一个计算属性 -->
      <input type="checkbox" id="toggle-all" class="toggle-all" v-model="allDone">
      <!-- 当点击 label 的时候其实就是点击了 checkbox -->
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <!-- li 在输入文本内容后重新生成了，导致光标失去焦点，是因为 key 的问题
          当前的这个key绑定的是todo.text，而todo.text又在input文本框中绑定了
          文本框中输入内容的时候 todo.text 的值发生了变化，当 key 变化之后，
          在重新渲染的时候发现新的 li 对应的 vNode 和 旧的 li 对应的 vNode
          的 key 不相同，所以会重新生成一个 li，所以可以修改成直接用 todo 对象
          来充当 key，因为每一个 todo 对象都是不相同的 -->
        <li
          v-for="todo in filteredTodos"
          :key="todo"
          :class="{ editing: todo === editingTodo, completed: todo.completed }"
        >
          <div class="view">
            <input type="checkbox" class="toggle" v-model="todo.completed">
            <!-- 双击 label 时 调用 editTodo 方法，记录text和更新状态 -->
            <label @dblclick="editTodo(todo)">{{ todo.text }}</label>
            <button class="destroy" @click="removeTodo(todo, index)"></button>
          </div>
          <!-- 在自定义指令中可以获取到值，这个值是动态的，如果是true
            则说明是当前正在编辑的文本框 -->
          <input
            type="text"
            class="edit"
            v-editing-focus="todo === editingTodo"
            v-model="todo.text"
            @keyup.enter="doneEdit(todo)"
            @blur="doneEdit(todo)"
            @keyup.esc="cancelEdit(todo)"
          >
        </li>
      </ul>
    </section>
    <footer class="footer">
      <span class="todo-count">
        <strong>1</strong> item left
      </span>
      <ul class="filters">
        <!-- 超链接的href属性此时是一个锚点，这里不使用路由，这个功能自己来实现
          首先要监视地址中 hash 的变化，当组件挂载完毕我们要注册 hashChange 事件，
          当组件卸载的时候 hashChange 事件移除，在hashChange 事件中我们要获取
          当前锚点的值，只需要这里的单词 all，active，completed，所以可以去掉 #/
          然后根据 hash 来判断要获取哪种状态的待办事项列表 -->
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
const useEdit = (removeTodo) => {
  // 创建一个非响应式的变量 用来记录编辑前的待办事项文本
  let beforeEditingText = ''
  // 创建一个响应式的对象 记录当前编辑的对象，作用是：
  // 用来标记当前是否是编辑状态（控制文件框的显示/隐藏）
  const editingTodo = ref(null)

  const editTodo = todo => {
    console.log("editTodo >> ", todo)
    beforeEditingText = todo.text
    // 记录当前是编辑状态
    editingTodo.value = todo
  }

  // 定义一个 按下回车 或者 文本框失去焦点时候 修改数据的函数
  const doneEdit = todo => {
    console.log("doneEdit >> ", todo)
    // 如果 editingTodo 编辑状态无值说明不是编辑状态则直接返回
    if (!editingTodo.value) return
    todo.text = todo.text.trim()
    todo.text || removeTodo(todo)
    editingTodo.value = null
  }

  const cancelEdit = todo => {
    console.log("cancelEdit >> ... ")
    editingTodo.value = null
    // 还原数据
    todo.text = beforeEditingText
  }

  return {
    editingTodo,
    editTodo,
    doneEdit,
    cancelEdit
  }

}

// 4.切换待办项的完成状态
const useFilter = (todos) => {
  // 创建计算属性，分别设置 getter、setter，
  // 当渲染 checkbox 的时候会调用 getter 获取当前状态
  // 当点击 checkbox 的时候会调用 setter 
  // 设置所有待办项的 completed 属性 和当前checkbox的
  // 选中状态保持一致
  const allDone = computed({
    get() {
      // 找到所有未完成的待办项，并返回其个数，加非！后则代表：
      // 所有待办项都完成（ !0 相当于 true ）则返回true，否则返回false
      return !todos.value.filter(todo => !todo.completed).length
    },
    set(value) {
      todos.value.forEach(todo => {
        todo.completed = value
      })
    }
  })
  
  // 定义一个 filter 的对象，此对象中包含与all，active，completed
  // 同名的过滤函数
  const filter = {
    // all 方法：返回列表中所有待办项
    all: list => list,
    // active 方法：返回所有未完成的待办项
    active: list => list.filter(todo => !todo.completed),
    // completed 方法：返回所有已完成的待办项
    completed: list => list.filter(todo => todo.completed)
  }

  // 创建一个响应式对象作用：在 onHashChange 中存储当前的 hash 值
  // 因为是响应式的对象，当其值发生变化的时候会重新 渲染模板，在重新渲染模板
  // 的时候，当执行到 v-for 的时候会调用计算属性filterTodos，刚好 type 
  // 是响应式的数据，它的值发生了变化，所以会重新执行计算属性来获取过滤后的
  // 待办事项
  const type = ref('all')

  // 定义一个计算属性，调用过滤方法返回过滤后的待办项
  const filteredTodos = computed(() => filter[type.value](todos.value))

  // 定义 hashchange 事件的处理方法
  const onHashChange = () => {
    // 获取地址中的 hash 值
    const hash = window.location.hash.replace('#/', '')
    // 根据 hash 值来获取对应的过滤函数，获取到则记录到响应式 type 中
    if (filter[hash]) {
      type.value = hash
    } else {
      // 在 filter 中找不到对应的过滤方法，
      // 也就是说 hash 不是 all，active，completed，可能对应的是
      // 页面首次加载，也可能是用户输入了不合法的 hash 值
      type.value = 'all'
      // 把地址栏中的 hash 值设置为空
      window.location.hash = ''
    }
  }

  // 当组件挂载后来注册 hashChange，通过 onMounted
  onMounted(() => {
    window.addEventListener('hashchange', onHashChange)
    // 页面首次加载的时候也需要去执行一下 onHashChange 方法
    // 去加载 todos 数据
    onHashChange()
  })

  // 负责移除事件
  onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange)
  })

  return {
    allDone,
    filteredTodos
  }
}

export default {
  name: 'App',
  setup() {
    // 创建一个响应式的 空数组，用来存放用户所有的待办事项
    const todos = ref([])
    const { removeTodo } = useRemove(todos)
    return {
      todos,
      removeTodo,
      // 调用 方法 并解构
      ...useAdd(todos),
      ...useEdit(removeTodo),
      ...useFilter(todos)
    }
  },
  // 注册指令
  directives: {
    editingFocus: (el, binding) => {
      // binding.value 为 true 则代表当前绑定的元素是正在编辑的文本框
      // 则调用 元素的 focus() 方法来获取焦点
      binding.value && el.focus()
    }
  },
}
</script>

<style>
</style>