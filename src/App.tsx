import Toolbar from './components/toolbar/Toolbar';
import TabBar from './components/toolbar/TabBar';
import CanvasWorkspace from './components/canvas/CanvasWorkspace';
import Toast from './components/common/Toast';

function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <Toolbar />
      <TabBar />
      <CanvasWorkspace />
      <Toast />
    </div>
  );
}

export default App;
