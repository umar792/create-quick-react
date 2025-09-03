import { createSlice } from "@reduxjs/toolkit";




const counterSlice = createSlice({
    name : "Counter",
    initialState : {
        counter : 0
    },
    reducers : {
        // increment counter
        incrementAction : (state,action)=>{
            state.counter = state.counter + action.payload;
        },
        decrementAction : (state , action)=>{
            if(action.payload === 0){
                state.counter = 0
            }else{
                state.counter = state.counter - action.payload
            }
        }

    }
});
export const counterReducer = counterSlice.reducer;
export const {incrementAction ,decrementAction} = counterSlice.actions; 