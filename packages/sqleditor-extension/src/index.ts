import editor_plugin from './editor'
import overview_plugin from './overview';
import {JupyterLabPlugin} from "@jupyterlab/application";

const plugins: JupyterLabPlugin<any>[] = [editor_plugin, overview_plugin];

export default plugins;