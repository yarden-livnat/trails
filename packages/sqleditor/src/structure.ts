
export
interface IStructureItem {
  type: string,
  name?: string,
  level?: number,
  pos?: number,
  fold?: boolean,
  folded?: boolean
}

export
class Structure {
  constructor() {
    this.items = [];
  }

  items: IStructureItem[];
}
