"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementAction = exports.incrementAction = exports.counterReducer = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const counterSlice = (0, toolkit_1.createSlice)({
    name: "Counter",
    initialState: {
        counter: 0
    },
    reducers: {
        // increment counter
        incrementAction: (state, action) => {
            state.counter = state.counter + action.payload;
        },
        decrementAction: (state, action) => {
            if (action.payload === 0) {
                state.counter = 0;
            }
            else {
                state.counter = state.counter - action.payload;
            }
        }
    }
});
exports.counterReducer = counterSlice.reducer;
_a = counterSlice.actions, exports.incrementAction = _a.incrementAction, exports.decrementAction = _a.decrementAction;
