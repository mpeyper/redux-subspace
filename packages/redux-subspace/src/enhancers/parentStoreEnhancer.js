/** 
 * Copyright 2018, IOOF Holdings Limited. 
 * All rights reserved. 
 * 
 * This source code is licensed under the BSD-style license found in the 
 * LICENSE file in the root directory of this source tree. 
 */ 
 
const parentStoreEnhancer = (createSubspace) => (store) => { 
  const subspace = createSubspace(store) 
  return { ...subspace, parentStore: store } 
} 

export default parentStoreEnhancer 
