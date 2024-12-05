/**
 * Move resources to a new module if defined and replace all hyphens with underscores.
 */
export function moveResources(
    resources: Map<string, string>,
    line: string,
    newModule?: string,
): string {
    if (
        (!line.startsWith('//') && !line.startsWith('#') && line.includes('resource ')) ||
        line.includes('module ')
    ) {
        const from = line
            .replaceAll('resource ', '')
            .replaceAll('{', '')
            .trim()
            .replaceAll(' ', '.')
            .replaceAll('"', '');
        const to = newModule
            ? `module.${newModule}.${from.replaceAll('-', '_')}`
            : from.replaceAll('-', '_');
        resources.set(from, to);
        // Replace all hyphens with underscores in the resource name
        return line.replaceAll('-', '_');
    }
    return line;
}
