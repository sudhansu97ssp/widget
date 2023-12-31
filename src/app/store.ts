import {
    configureStore,
    ThunkAction,
    Action,
    combineReducers,
    PreloadedState
} from '@reduxjs/toolkit'
import CarousalSlice from '../components/Carousal/Carousal.slice'


const rootReducer = combineReducers({
    carousalStore: CarousalSlice
})

export function setupStore(preloadedState?: PreloadedState<RootState>) {
    return configureStore({
      reducer: rootReducer,
      preloadedState
    })
  }

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>