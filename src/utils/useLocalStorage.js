function parse(str) {
  let value
  try {
    value = JSON.parse(str)
  } catch {
    value = null
  }
  return value
}

function stringify(obj) {
  let value
  try {
    value = JSON.stringify(obj)
  } catch {
    value = null
  }
  return value
}

// 导出一个use函数
export default function useLocalStorage() {
  function setItem(key, value) {
    window.localStorage.setItem(key, stringify(value))
  }
  function getItem(key) {
    let value = window.localStorage.getItem(key)
    if (value) {
      value = parse(value)
    }
    return value
  }
  return {
    setItem,
    getItem
  }
}