const { createState } = require('react-lingost')


export const user = createState('user', {
     isLogin: null,
     info: {}
})