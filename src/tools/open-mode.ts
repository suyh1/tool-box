export function shouldOpenToolInDialog(currentPath: string, toolPath: string) {
  return currentPath === '/tools' || currentPath.startsWith('/tools/category/')
    ? currentPath !== toolPath
    : false
}
