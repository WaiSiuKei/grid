let classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
let notClassId = /^\.|#/;

export function parseTag(tag: string, props: { [key: string]: any }): string {
  if (!tag) {
    return 'DIV';
  }

  let noId = !(props.hasOwnProperty('id'));

  let tagParts = tag.split(classIdSplit);
  let tagName = null;

  if (notClassId.test(tagParts[1])) {
    tagName = 'DIV';
  }

  let classes, part, type, i;

  for (i = 0; i < tagParts.length; i++) {
    part = tagParts[i];

    if (!part) {
      continue;
    }

    type = part.charAt(0);

    if (!tagName) {
      tagName = part;
    } else if (type === '.') {
      classes = classes || [];
      classes.push(part.substring(1, part.length));
    } else if (type === '#' && noId) {
      props.id = part.substring(1, part.length);
    }
  }

  if (classes) {
    if (props.className) {
      classes.push(props.className);
    }

    props.className = classes.join(' ');
  }

  return props.namespace ? tagName : tagName.toUpperCase();
}
