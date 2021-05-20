import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import archiver from 'archiver';
import klawSync from 'klaw-sync';
import { getSimpleFileSize } from './util';

/**
 * 插件选项
 */
interface Options {
    /**
     * 源目录，默认为 dist
     */
    src?: string;
    /**
     * ，默认为 offline
     */
    zipFileName?: string;
    /**
     * 目标路径，不需要 schema
     */
    destUrl: string;
    /**
     * 路径映射
     */
    mapping: {
        /**
         * 相对于根目录的相对路径
         */
        src: string;
        /**
         * 目标路径，不需要 schema
         */
        destUrl: string;
    }[];
    /**
     * 压缩配置
     */
    zipConfig: archiver.ArchiverOptions | undefined;
}

const PLUGIN_NAME = 'DMOfflineWebpackPlugin';

const cwd = process.cwd();

class ZAOfflineWebpackPlugin {
    options: Required<Options>;

    constructor(options: Options) {
        // @ts-ignore
        this.options = options;
    }

    /**
     * 逻辑很简单，就是在打包结束之后，把dist目录转换成离线资源包目录
     * @param compiler
     */
    apply(compiler) {
        compiler.hooks.done.tap(PLUGIN_NAME, () => {
            this.doWork();
        });
    }

    doWork() {
        this.prepare();
        this.copyFiles();
        this.zipFile();
    }

    prepare() {
        this.options.src = this.options.src || 'dist';
        this.options.zipFileName = this.options.zipFileName || 'offline';
        this.options.src = path.resolve(cwd, this.options.src);
        this.options.zipFileName = path.resolve(cwd, this.options.zipFileName);
        this.options.mapping = this.options.mapping || [];

        this.options.destUrl = this.options.destUrl.replace('http://', '').replace('https://', '').replace('//', '');
        this.options.mapping.forEach((item) => {
            item.destUrl = item.destUrl.replace('http://', '').replace('https://', '').replace('//', '');
            item.src = path.resolve(this.options.src, item.src);
            item.destUrl = path.resolve(this.options.zipFileName, item.destUrl);
        });

        fs.removeSync(this.options.zipFileName);
        fs.removeSync(this.options.zipFileName + '.zip');
    }

    copyFiles() {
        // 有mapping的复制到mapping中
        this.options.mapping.forEach((item) => {
            if (!fs.existsSync(item.src)) {
                this.message('warn', `${item.src} 不存在`);
                return;
            }
            fs.copySync(item.src, item.destUrl);
        });
        // 其他文件复制到主域名中
        const files = fs.readdirSync(this.options.src);
        files.forEach((file) => {
            const filePath = path.resolve(this.options.src, file);
            const destPath = path.resolve(this.options.zipFileName, this.options.destUrl, file);
            fs.copySync(filePath, destPath);
            // 把mapping中的文件删掉
            this.options.mapping.forEach((item) => {
                const mappingName = path.relative(this.options.src, item.src);
                const delPath = path.resolve(this.options.zipFileName, this.options.destUrl, mappingName);
                fs.removeSync(delPath);
            });
        });
    }

    zipFile() {
        const srcDir = this.options.zipFileName;
        const targetZip = this.options.zipFileName + '.zip';

        if (!fs.existsSync(srcDir)) {
            this.message('warn', `${srcDir} 不存在`);
            return;
        }

        const output = fs.createWriteStream(targetZip);
        const archive = archiver('zip', this.options.zipConfig);

        output.on('close', () => {
            this.message('success', 'zip文件总大小 ' + getSimpleFileSize(archive.pointer()) + '\n');
            fs.removeSync(this.options.zipFileName);
        });

        archive.on('error', (err) => {
            this.message('error', '压缩发生错误');
            throw err;
        });

        if (!fs.existsSync(srcDir)) {
            this.message('error', srcDir + ' 不存在');
            return;
        }
        let zipFiles = klawSync(srcDir, { nodir: true });
        zipFiles.forEach((item) => {
            // console.log('文件路径：'+item.path)
            archive.file(item.path, { name: path.relative(this.options.src, item.path) });
        });
        archive.pipe(output);
        archive.finalize();
    }

    message(type: 'success' | 'info' | 'warn' | 'error', msg: string) {
        const chalkFuc = {
            success: chalk.green,
            info: chalk.cyan,
            warn: chalk.yellow,
            error: chalk.red,
        };

        console.log(chalkFuc[type](`[dm-offline-webpack-plugin]  ${msg}`));
    }
}

export { ZAOfflineWebpackPlugin };
