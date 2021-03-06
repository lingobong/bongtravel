// controller랑 헷갈리니깐 storage는 명사를 앞에 써주자

const { useAsyncStorage } = require('@react-native-community/async-storage')

const storages = {}

const createStorage = function ( key, { set, get } ) {
     if ( storages[key] ) {
          return storages[key]
     }

     const storage = useAsyncStorage('@bongtravel_v1:' + key)
     let functions = { set: (value): Promise<Object> => {}, get: (): Promise<Object> => {} } // vscode 자동완성을 위해 인터페이스 정의

     functions.set = set(storage.setItem)
     functions.get = get(storage.getItem)

     // travelWrite쪽에서는 createStorage를 계속 호출하기때문에 storages에 저장해두고, 저장된걸 갖다쓴다
     storages[key] = functions

     return functions
}

let travelSelectedIdx = createStorage('travelSelectedIdx', {
     set(setItem){
          return (value) => setItem(value+'').then(()=>value) // string으로 저장 // 저장된 값 반환
     },
     get(getItem){
          return async() => +(await getItem() || 0) // number로 변환
     },
})

class travelWrite {
     static InputTabs = (travelId) => createStorage('travelWriteInputTabs/'+travelId, {
          set(setItem){
               return (array) => setItem(JSON.stringify(array)).then(()=>array) // string으로 저장 // 저장된 값 반환
          },
          get(getItem){
               return async() => JSON.parse(await getItem() || '[]') // json으로 변환
          },
     })

     static Inputs = (travelId) => createStorage('travelWriteInputs/'+travelId, {
          set(setItem){
               return (array) => setItem(JSON.stringify(array)).then(()=>array) // string으로 저장 // 저장된 값 반환
          },
          get(getItem){
               return async() => JSON.parse(await getItem() || '[]') // json으로 변환
          },
     })
}


let loginToken = createStorage('loginToken', {
     set(setItem){
          return (value) => setItem(value+'').then(()=>value) // string으로 저장 // 저장된 값 반환
     },
     get(getItem){
          return async() => await getItem() || ''
     },
})


module.exports = {
     travelSelectedIdx,
     travelWrite,
     loginToken,
}