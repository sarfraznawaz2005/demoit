const SETTINGS_PATH = './settings.json';
const CODEMIRROR_SETTINGS = {
  value: '',
  mode:  'jsx',
  tabSize: 2,
  lineNumbers: false,
  autofocus: true,
  foldGutter: false,
  gutters: []
};

const el = function (sel) { return document.querySelector(sel); };
const addStyleString = function (str) {
  const node = document.createElement('style');

  node.innerHTML = str;
  document.body.appendChild(node);
}
const addJSFile = function (path) {
  const node = document.createElement('script');

  node.src = path;
  document.body.appendChild(node);
}

// ********************************************************************************* EDITOR
const createEditor = function (settings, onChange) {
  const container = el('.js-code-editor');
  const editor = CodeMirror(
    container,
    Object.assign({}, CODEMIRROR_SETTINGS, settings.editor)
  );

  editor.on('change', function () {
    onChange(editor.getValue());
  });
  editor.setValue('');
  container.addEventListener('click', function () {
    editor.focus();
  });

  addStyleString(`
    .js-code-editor {
      font-size: ${ settings.editor.fontSize };
      line-height: ${ settings.editor.lineHeight };
    }
  `);

  return {
    demo: 0,
    frame: 0,
    async showFrame() {
      try {
        const res = await fetch(settings.demos[this.demo].frames[this.frame].path);
        const code = await res.text();

        editor.setValue(code);
      } catch (error) {
        console.error(error);
      }
    }
  };
};
const loadEditorTheme = async function(settings) {
  try {
    const res = await fetch(`./vendor/codemirror/theme/${ settings.editor.theme }.css`);
    const css = await res.text();

    addStyleString(css);
  } catch (error) {
    console.log(error);
  }
}

// ********************************************************************************* OUTPUT
const createOutput = function(settings) {
  const element = el('.output');

  addStyleString(`
    .output {
      background-color: ${ settings.output.backgroundColor };
      font-size: ${ settings.output.fontSize };
      line-height: ${ settings.output.lineHeight };
    }
  `)
}
// ********************************************************************************* SETTINGS
const createSettingsPanel = function(settings) {
  const toggler = el('.settings-button');
  const panel = el('.settings');
  let visible = false;

  toggler.addEventListener('click', () => {
    visible = !visible;
    panel.style.display = visible ? 'block' : 'none';
  });
}

// ********************************************************************************* OTHER
const initColumnResizer = function () {
  let resizable = ColumnResizer.default;
        
  new resizable(
    document.querySelector(".container"),
    {
      resizeMode: 'fit',
      liveDrag: true,
      draggingClass: 'rangeDrag',
      minWidth: 8
    }
  );
}
const getSettings = async function (path) {
  const res = await fetch(path);
  return await res.json();
}
const getResources = async function (settings) {
  settings.resources.forEach(resource => {
    const extension = resource.split('.').pop().toLowerCase();

    if (extension === 'js') {
      addJSFile(resource)
    }
  });
}

// ********************************************************************************* INIT
const initialize = async function (settings) {
  await getResources(settings);
  await loadEditorTheme(settings);

  const output = createOutput(settings);
  const settingsPanel = createSettingsPanel(settings);
  const editor = createEditor(settings, text => {
    console.log(text);
  });

  await editor.showFrame();

};

window.onload = async function () {
  initColumnResizer();
  initialize(await getSettings(SETTINGS_PATH));
};