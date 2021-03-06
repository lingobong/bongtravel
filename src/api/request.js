const config = require('../config')
const delay = require('../plugins/delay')
const Storage = require('../plugins/storage')

async function request({
     path,
     method,
     body,
     headers = {},
     isUpload = false,
}) {
     path = path.replace(/^\//,'')
     
     // header 기본값 설정
     if (!headers) headers = {};
     if (!headers.authorization) headers.authorization = '';

     if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
     if (!!body) {
          if (isUpload) {
               headers['Content-Type'] = 'multipart/form-data'
          } else {
               body = JSON.stringify(body)
          }
     }

     let loginToken = await Storage.loginToken.get()
     headers['Authorization'] = loginToken

     return await fetch(config.api + path, {
          method,
          body,
          headers,
     }).then(rs=>rs.json()).then(rs=>{
          if (rs.authRequired) {
               // ../lingost/api에서도 request.js를 import 하므로, request 함수 안에서 require하도록한다
               require('../lingost/api').loginCheck()
               return { success: false }
          }else{
               return rs
          }
     })
}

// get 은 단순 읽어오기이므로, 오류 시 세 번까지 다시 시도한다
async function getFunction({ path, body, headers={} }){
     return new Promise(async(resolve, reject) => {
          let error = null
          for (let i = 0 ; i < 3 ; i ++) {
               try{
                    // 호출이 잘 됐으면 바로 완료처리 
                    let req = await request({
                         method: 'GET',
                         path,
                         headers,
                    })
                    return resolve(req)
               }catch(e){
                    error = e
                    await delay(1000)
               }
               // 실패하면 세 번까지 시도한 후 reject으로 넘겨주기
               reject(error)
          }
     })
}

function postFunction({ path, body, headers={}, isUpload }){
     return request({
          method: 'POST',
          path,
          body,
          headers,
          isUpload,
     })
}

function deleteFunction({ path, body, headers={} }){
     return request({
          method: 'DELETE',
          path,
          body,
          headers,
     })
}

function putFunction({ path, body, headers={}, isUpload }){
     return request({
          method: 'PUT',
          path,
          body,
          headers,
          isUpload,
     })
}

module.exports = {
     'get': getFunction,
     'post': postFunction,
     'delete': deleteFunction,
     'put': putFunction,
}