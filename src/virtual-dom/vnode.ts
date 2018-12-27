export function isVirtualNode(x: any) {
  return x && x.type === 'VirtualNode';
}

export function isVirtualText(x: any) {
  return x && x.type === 'VirtualText';
}

export class VirtualNode {
  public type = 'VirtualNode';
  public tagName: string;
  public properties: { [key: string]: any };
  public children: VirtualNode[] = [];
  public key: string;

  count: number;

  constructor(tagName: string, properties = Object.create(null), children: VirtualNode[] = [], key?: string) {
    this.tagName = tagName;
    this.properties = properties;
    this.children = children;
    this.key = key != null ? String(key) : undefined;

    let count = (children && children.length) || 0;
    let descendants = 0;

    for (let propName in properties) {
      if (properties.hasOwnProperty(propName)) {
        let property = properties[propName];
      }
    }

    for (let i = 0; i < count; i++) {
      let child = children[i];
      if (isVirtualNode(child)) {
        descendants += child.count || 0;
      }
    }

    this.count = count + descendants;
  }
}

export class VirtualText extends VirtualNode {
  type = 'VirtualText';
  text: string;
  constructor(text: string) {
    super('');
    this.text = String(text);
  }
}
