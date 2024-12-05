function replaceHyphens(line: string) {
    const parts = line.split('.');
    if (parts.length >= 2) {
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].includes('_')) {
                if (parts[i + 1] && parts[i + 1].includes('-')) {
                    const newPart = parts[i + 1].replaceAll('-', '_');
                    parts[i + 1] = newPart;
                    i++;
                }
            }
        }
    }
    return parts.join('.');
}

export function fixResourceReferences(line: string): string {
    /**
     * Fix all references to the resource name if it's been renamed
     * Before: google_service_account.my-sa.member
     * After: google_service_account.my_sa.member
     */
    if (!line.startsWith('source') && line.includes('.')) {
        /**
         * If the line doesn't have any quotes, it's a direct reference
         */
        let updatedLine = '';
        if (!line.includes('"')) {
            updatedLine = replaceHyphens(line);
            /**
             * We found string interpolation reference
             */
        } else if (line.includes('${')) {
            // parts [ "  member             = \"principalSet://iam.googleapis.com/", "module.my-cluster.iam-workload_identity-pool}/attribute.repository/my-org/my-repo\"" ]
            const parts = line.split('${');
            for (let i = 0; i < parts.length; i++) {
                /**
                 * At least one resource in the parts2 is a reference
                 * [ "  member             = \"principalSet://iam.googleapis.com/" ]
                 * [ "module.my-cluster.iam-workload_identity-pool", "/attribute.repository/my-org/my-repo\"" ]
                 */
                const parts2 = parts[i].split('}');
                for (let j = 0; j < parts2.length; j++) {
                    if (parts2[j].includes('.')) {
                        const updatedPart = replaceHyphens(parts2[j]);
                        parts2[j] = updatedPart;
                    }
                }
                parts[i] = parts2.join('}');
            }
            updatedLine = parts.join('${');
        }

        if (updatedLine !== '' && line !== updatedLine) {
            /**
             * TODO: Maybe print the diff in a git diff colored format
             */
            console.log('Fixed resource references:');
            console.log('-', line);
            console.log('+', updatedLine);
            return updatedLine;
        }
    }
    return line;
}
