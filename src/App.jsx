import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { router } from '../src/router/router';
import { verifyToken } from './store/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppInitializer = () => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(verifyToken());
    }
  }, [dispatch, isInitialized]);

  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <AppInitializer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Provider>
  );
};

export default App;