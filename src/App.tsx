import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  createContext,
  createSignal,
  JSXElement,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js';
import '@/App.css';

export interface AppContextProps {
  setTopLeft?: (items: JSXElement[]) => any;
  setTopRight?: (items: JSXElement[]) => any;
  setBottomLeft?: (items: JSXElement[]) => any;
  setBottomRight?: (items: JSXElement[]) => any;
  setLeftTop?: (items: JSXElement[]) => any;
  setLeftBottom?: (items: JSXElement[]) => any;
  setRightTop?: (items: JSXElement[]) => any;
  setRightBottom?: (items: JSXElement[]) => any;
  setCenterLeft?: (item: JSXElement) => any;
  setCenterRight?: (item: JSXElement) => any;
  setCenterBottom?: (item: JSXElement) => any;
  registerShortcut?: (
    keyCombination: string,
    onAction: (event: KeyboardEvent) => any,
  ) => any;
  unregisterShortcut?: (keyCombination: string) => any;
}

export const AppContext = createContext<AppContextProps>({});
export const useApp = () => useContext(AppContext);

export interface AppProviderProps {
  children: JSXElement;
}

export interface AppProps {
  topLeft?: JSXElement[];
  topRight?: JSXElement[];
  bottomLeft?: JSXElement[];
  bottomRight?: JSXElement[];
  leftTop?: JSXElement[];
  leftBottom?: JSXElement[];
  rightTop?: JSXElement[];
  rightBottom?: JSXElement[];
  centerLeft?: JSXElement;
  centerRight?: JSXElement;
  centerBottom?: JSXElement;
}

export const App = (props: AppProps) => {
  const [topLeft, setTopLeft] = createSignal<JSXElement[]>(props.topLeft || []);
  const [topRight, setTopRight] = createSignal<JSXElement[]>(
    props.topRight || [],
  );
  const [bottomLeft, setBottomLeft] = createSignal<JSXElement[]>(
    props.bottomLeft || [],
  );
  const [bottomRight, setBottomRight] = createSignal<JSXElement[]>(
    props.bottomRight || [],
  );
  const [leftTop, setLeftTop] = createSignal<JSXElement[]>(props.leftTop || []);
  const [leftBottom, setLeftBottom] = createSignal<JSXElement[]>(
    props.leftBottom || [],
  );
  const [rightTop, setRightTop] = createSignal<JSXElement[]>(
    props.rightTop || [],
  );
  const [rightBottom, setRightBottom] = createSignal<JSXElement[]>(
    props.rightBottom || [],
  );
  const [centerLeft, setCenterLeft] = createSignal<JSXElement>(
    props.centerLeft || <></>,
  );
  const [centerRight, setCenterRight] = createSignal<JSXElement>(
    props.centerRight || <></>,
  );
  const [centerBottom, setCenterBottom] = createSignal<JSXElement>(
    props.centerBottom || <></>,
  );

  const [maximal, setMaximal] = createSignal<boolean>(false);
  const [splitterValue, setSplitterValue] = createSignal({
    left: { moving: false, value: 0 },
    right: { moving: false, value: 0 },
    bottom: { moving: false, value: 0 },
  });
  const [splitterPosition, setSplitterPosition] = createSignal<
    [number, number]
  >([0, 0]);
  let centerLeftDiv: HTMLDivElement | undefined;
  let centerRightDiv: HTMLDivElement | undefined;
  let centerBottomDiv: HTMLDivElement | undefined;

  const [shortcuts, setShortcuts] =
    createSignal<Record<string, (event: KeyboardEvent) => any>>();

  const registerShortcut = (
    keyCombination: string,
    onAction: (event: KeyboardEvent) => any,
  ) => {
    setShortcuts((prev) => ({ ...prev, [keyCombination]: onAction }));
  };
  const unregisterShortcut = (keyCombination: string) => {
    setShortcuts((prev) => {
      if (!prev) {
        return prev;
      }
      delete prev[keyCombination];
      return prev;
    });
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    const { ctrlKey, altKey, shiftKey, code } = event;
    console.log(
      `${ctrlKey ? 'CTRL-' : ''}${altKey ? 'ALT-' : ''}${shiftKey ? 'SHIFT-' : ''}${code}`,
    );
    shortcuts()?.[
      `${ctrlKey ? 'CTRL-' : ''}${altKey ? 'ALT-' : ''}${shiftKey ? 'SHIFT-' : ''}${code}`
    ]?.(event);
  };

  const computeInlineItems = (items?: JSXElement[]) => {
    return items?.map((item) => <div>{item}</div>);
  };

  getCurrentWindow()
    .onMoved(() => {
      getCurrentWindow()
        .isMaximized()
        .then((isMaximized) => {
          setMaximal(isMaximized);
        });
    })
    .then();
  const handleMinimize = () => {
    getCurrentWindow().minimize().then();
  };
  const handleMaximize = () => {
    getCurrentWindow()
      .isMaximized()
      .then((isMaximized) => {
        setMaximal(!isMaximized);
        if (isMaximized) {
          getCurrentWindow().unmaximize().then();
        } else {
          getCurrentWindow().maximize().then();
        }
      });
  };
  const handleClose = () => {
    getCurrentWindow().close().then();
  };
  const handleTitleMouseMove = (event: MouseEvent) => {
    if (
      event.button === 0 &&
      event.target instanceof Element &&
      !event.target?.closest('.icon, .left, .right, .action')
    ) {
      getCurrentWindow().startDragging().then();
    }
  };
  const handleTitleMouseUp = (event: MouseEvent) => {
    if (
      event.button === 0 &&
      event.detail === 2 &&
      event.target instanceof Element &&
      !event.target?.closest('.icon, .left, .right, .action')
    ) {
      handleMaximize();
    }
  };
  const handleSplitterMouseDown = (
    event: MouseEvent,
    direction: 'left' | 'right' | 'bottom',
  ) => {
    switch (direction) {
      case 'left':
        setSplitterValue((value) => {
          value.left = {
            moving: true,
            value: centerLeftDiv ? centerLeftDiv.offsetWidth : 0,
          };
          return value;
        });
        break;
      case 'right':
        setSplitterValue((value) => {
          value.right = {
            moving: true,
            value: centerRightDiv ? centerRightDiv.offsetWidth : 0,
          };
          return value;
        });
        break;
      case 'bottom':
        setSplitterValue((value) => {
          value.bottom = {
            moving: true,
            value: centerBottomDiv ? centerBottomDiv.offsetHeight : 0,
          };
          return value;
        });
    }
    setSplitterPosition([event.clientX, event.clientY]);
    document.documentElement.addEventListener('mousemove', handlePageMouseMove);
    document.documentElement.addEventListener('mouseup', handlePageMouseUp);
  };
  const handlePageMouseMove = (event: MouseEvent) => {
    const [offsetX, offsetY] = [
      event.clientX - splitterPosition()[0],
      event.clientY - splitterPosition()[1],
    ];
    if (splitterValue().left.moving) {
      centerLeftDiv &&
        (centerLeftDiv.style.width = `${splitterValue().left.value + offsetX}px`);
    }
    if (splitterValue().right.moving) {
      centerRightDiv &&
        (centerRightDiv.style.width = `${splitterValue().right.value - offsetX}px`);
    }
    if (splitterValue().bottom.moving) {
      centerBottomDiv &&
        (centerBottomDiv.style.height = `${splitterValue().bottom.value - offsetY}px`);
    }
  };
  const handlePageMouseUp = () => {
    setSplitterValue((value) => {
      value.left.moving = false;
      value.right.moving = false;
      value.bottom.moving = false;
      return value;
    });
    document.documentElement.removeEventListener(
      'mousemove',
      handlePageMouseMove,
    );
    document.documentElement.removeEventListener('mouseup', handlePageMouseUp);
  };
  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
  });
  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
  return (
    <AppContext.Provider
      value={{
        setTopLeft,
        setTopRight,
        setBottomLeft,
        setBottomRight,
        setLeftTop,
        setLeftBottom,
        setRightTop,
        setRightBottom,
        setCenterLeft,
        setCenterRight,
        setCenterBottom,
        registerShortcut,
        unregisterShortcut,
      }}
    >
      <header
        class="title"
        onMouseMove={handleTitleMouseMove}
        onMouseUp={handleTitleMouseUp}
      >
        <div class="icon">
          <div>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              width="20"
              height="20"
              fill="var(--color-fill,currentColor)"
            >
              <path
                d="M660.36 396.732a80.612 80.612 0 0 1-137.604 57 80.608 80.608 0 1 1 137.6-57z"
                fill="#FFCA28"
              ></path>
              <path
                d="M444.16 546.96c-44.52 0-80.608 36.088-80.608 80.604 0 44.52 36.088 80.608 80.608 80.608 44.516 0 80.608-36.088 80.608-80.608 0-44.516-36.092-80.6-80.608-80.6z"
                fill="#26C6DA"
              ></path>
              <path
                d="M746.8 655.04a307.808 307.808 0 0 1-106.256 43.24 216.168 216.168 0 0 0 10.628-97.464 216.2 216.2 0 0 0 135.424-140.984 216.16 216.16 0 0 0-110.92-256.84 216.176 216.176 0 0 0-271.452 67.708 359.064 359.064 0 0 0-117.98 34.44 307.756 307.756 0 0 1 345.96-212.232 307.76 307.76 0 0 1 255.552 315.316 307.744 307.744 0 0 1-140.96 246.824zM289.92 361.192l75.476 9.16a216.2 216.2 0 0 1 9.524-42.868 307.812 307.812 0 0 0-85 33.708z"
                fill="#FFCA28"
              ></path>
              <path
                d="M276.728 369.256a307.748 307.748 0 0 1 106.988-43.6 215.804 215.804 0 0 0-12.092 97.828 216.2 216.2 0 0 0-134.56 141.432 216.16 216.16 0 0 0 209.416 278.4 216.176 216.176 0 0 0 173.192-90.08 358.988 358.988 0 0 0 117.98-34.072 307.744 307.744 0 0 1-200.008 201.692 307.752 307.752 0 0 1-279.968-47.968A307.776 307.776 0 0 1 276.72 369.26z m456.88 293.848l-1.464 0.732z"
                fill="#26C6DA"
              ></path>
            </svg>
          </div>
        </div>
        <div class="left">{computeInlineItems(topLeft())}</div>
        <div class="center"></div>
        <div class="right">{computeInlineItems(topRight())}</div>
        <div class="action">
          <div onClick={handleMinimize}>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="var(--color-fill,currentColor)"
            >
              <path d="M3 12a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1"></path>
            </svg>
          </div>
          <div onClick={handleMaximize}>
            {maximal() ? (
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="var(--color-fill,currentColor)"
              >
                <path d="M19 3a2 2 0 0 1 1.995 1.85L21 5v10a2 2 0 0 1-1.85 1.995L19 17h-2v2a2 2 0 0 1-1.85 1.995L15 21H5a2 2 0 0 1-1.995-1.85L3 19V9a2 2 0 0 1 1.85-1.995L5 7h2V5a2 2 0 0 1 1.85-1.995L9 3zm-4 6H5v10h10zm4-4H9v2h6l.15.005a2 2 0 0 1 1.844 1.838L17 9v6h2z"></path>
              </svg>
            ) : (
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="var(--color-fill,currentColor)"
              >
                <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm16 0H5v14h14z"></path>
              </svg>
            )}
          </div>
          <div onClick={handleClose}>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16px"
              height="16px"
              fill="var(--color-fill,currentColor)"
            >
              <path d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414z"></path>
            </svg>
          </div>
        </div>
      </header>
      <aside class="left">
        <div class="top">{computeInlineItems(leftTop())}</div>
        <div class="center"></div>
        <div class="bottom">{computeInlineItems(leftBottom())}</div>
      </aside>
      <aside class="right">
        <div class="top">{computeInlineItems(rightTop())}</div>
        <div class="center"></div>
        <div class="bottom">{computeInlineItems(rightBottom())}</div>
      </aside>
      <main class="center">
        <div class="top">
          <div ref={centerLeftDiv} class="left">
            <div
              class="splitter"
              onMouseDown={(event) => handleSplitterMouseDown(event, 'left')}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="var(--color-fill,currentColor)"
              >
                <path d="M18 16v-3h-3v9h-2V2h2v9h3V8l4 4zM2 12l4 4v-3h3v9h2V2H9v9H6V8z"></path>
              </svg>
            </div>
            {centerLeft()}
          </div>
          <div class="center"></div>
          <div ref={centerRightDiv} class="right">
            <div
              class="splitter"
              onMouseDown={(event) => handleSplitterMouseDown(event, 'right')}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="var(--color-fill,currentColor)"
              >
                <path d="M18 16v-3h-3v9h-2V2h2v9h3V8l4 4zM2 12l4 4v-3h3v9h2V2H9v9H6V8z"></path>
              </svg>
            </div>
            {centerRight()}
          </div>
        </div>
        <div ref={centerBottomDiv} class="bottom">
          <div
            class="splitter"
            onMouseDown={(event) => handleSplitterMouseDown(event, 'bottom')}
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="var(--color-fill,currentColor)"
            >
              <path d="M8 18h3v-3H2v-2h20v2h-9v3h3l-4 4zm4-16L8 6h3v3H2v2h20V9h-9V6h3z"></path>
            </svg>
          </div>
          {centerBottom()}
        </div>
      </main>
      <footer class="status">
        <div class="left">{computeInlineItems(bottomLeft())}</div>
        <div class="center"></div>
        <div class="right">{computeInlineItems(bottomRight())}</div>
      </footer>
    </AppContext.Provider>
  );
};
