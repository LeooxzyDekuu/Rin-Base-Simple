const { js } = require("js-beautify");
const fs = require('fs');

class CaseManager {
    constructor(file) {
        this.file = file;
    }

    get = (name) => {
        try {
            const content = fs.readFileSync(this.file, 'utf8');
            const regex = new RegExp(`case ['"\`]${name}['"\`]:([\\s\\S]*?)(?=\\bcase ['"\`]|default:|}$)`, 'g');
            const match = regex.exec(content);
            return match ? `case '${name}':${match[1]}` : null;
        } catch (error) {
            console.error(`Gagal membaca file: ${error.message}`);
            return null;
        }
    }

    add = (code) => {
        try {
            const content = fs.readFileSync(this.file, 'utf8');

            const switchIndex = content.search(/switch\s*.*?\s*{[\s\S]*?$/);
            if (switchIndex === -1) throw new Error('Blok switch tidak ditemukan.');

            const caseNameMatch = code.match(/^\s*case\s+['"`]([^'"`]+)['"`]\s*:/gm);
            if (!caseNameMatch) throw new Error('Kode case tidak valid.');

            const caseName = caseNameMatch[1];

        
            if (this.list().includes(caseName)) {
               throw new Error(`Case '${caseName}' sudah ada.`);
            }

            const insertPosition = content.indexOf('{', switchIndex) + 1;
            const newContent = content.slice(0, insertPosition) + '\n' + code + content.slice(insertPosition);

            fs.writeFileSync(this.file, js(newContent));
            return true;
        } catch (error) {
            console.error(`Gagal menambahkan case: ${error.message}`);
            return false;
        }
    }

    delete = (name) => {
        try {
            let content = fs.readFileSync(this.file, 'utf8');
            const block = this.get(name);
            if (!block) return false;
            const updated = content.replace(block, '');
            fs.writeFileSync(this.file, js(updated));
            return true;
        } catch (error) {
            console.error(`Gagal menghapus case: ${error.message}`);
            return false;
        }
    }

    list = () => {
        try {
            const content = fs.readFileSync(this.file, 'utf8');
            const regex = /case\s+['"`]([^'"`]+)['"`]:/g;
            const matches = [];
            let match;
            while ((match = regex.exec(content)) !== null) {
                matches.push(match[1]);
            }
            return [...new Set(matches)];
        } catch (error) {
            console.error(`Gagal membaca file: ${error.message}`);
            return [];
        }
    }
}

module.exports = CaseManager;
