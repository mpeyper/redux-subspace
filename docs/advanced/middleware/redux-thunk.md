# redux-thunk

The [`redux-thunk` middleware](https://github.com/gaearon/redux-thunk) works simply by using [Redux Subspace's `applyMiddleware` function](/docs/advanced/middleware/README.md).

```javascript
import { createStore } from 'redux'
import { applyMiddleware } from 'redux-subspace'
import thunk from 'redux-thunk'

const store = createStore(reducer, applyMiddleware(thunk))
```

Now, the `dispatch` parameter of the thunk will apply the namespacing logic of the subspace it was dispatched from. Likewise, the `getState` parameter will return the state mapped from the `mapState` selector used to create the subspace.
