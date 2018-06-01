import editor_plugin from './editor_plugin'
import overview_plugin from './overview_plugin';
import {JupyterLabPlugin} from "@jupyterlab/application";

const plugins: JupyterLabPlugin<any>[] = [editor_plugin, overview_plugin];

export default plugins;