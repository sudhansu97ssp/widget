import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { RootState } from '../../app/store'
import { Product } from './Carousal.types'

export interface CarousalState {
    status: 'idle' | 'loading' | 'failed',
    product: Product
}

const initialState: CarousalState = {
    status: 'idle',
    product: { apiLoadTime: 0 }
}

export const fetchProduct = createAsyncThunk(
    'product/fetch',
    async ({ productId, setPageLoad }: { productId: string, setPageLoad: any }) => {
        let startTime = new Date().getTime()
        const url = `${process.env.REACT_APP_BASE_URL}/apis/v1/widget/product/${productId}`
        const response = await axios.get(url)
        // The value we return becomes the `fulfilled` action payload
        response.data.apiLoadTime = new Date().getTime() - startTime
        setPageLoad(true);
        return response.data
    }
)

export const carousalSlice = createSlice({
    name: 'carousal',
    initialState,
    reducers: {
        fetchProduct: (state: CarousalState, action: PayloadAction) => {
            state.product = action.payload as unknown as Product;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProduct.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchProduct.fulfilled, (state, action) => {
                state.status = 'idle'
                state.product = action.payload;
            })
            .addCase(fetchProduct.rejected, (state) => {
                state.status = 'failed';
            })
    }
})

export const selectCarousalState = (state: RootState) => state.carousalStore
export default carousalSlice.reducer
