
const promise1 = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Promise 1 resolved')
  }, 500)
})


const promise2 = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('Promise 2 rejected')
  }, 700)
})


const promise3 = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Promise 3 resolved')
  }, 800)
})

const start = new Date()
const a = await Promise.allSettled([promise1(), promise2(), promise3()])
const end = new Date()

console.log(a, end - start)