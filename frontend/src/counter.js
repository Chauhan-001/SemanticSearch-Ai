export function setupCounter(element) {
  let count = 0
  const setCounter = (count) => {
    element.innerHTML = `Count is ${count}`
  }
  element.addEventListener('click', () => setCounter(count + 1))
  setCounter(0)
}