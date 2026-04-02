"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectCounterValue = exports.reset = exports.incrementByAmount = exports.decrement = exports.increment = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    value: 0,
};
const counterSlice = (0, toolkit_1.createSlice)({
    name: "counter",
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
        reset: (state) => {
            state.value = 0;
        },
    },
});
_a = counterSlice.actions, exports.increment = _a.increment, exports.decrement = _a.decrement, exports.incrementByAmount = _a.incrementByAmount, exports.reset = _a.reset;
const selectCounterValue = (state) => state.counter.value;
exports.selectCounterValue = selectCounterValue;
exports.default = counterSlice.reducer;
