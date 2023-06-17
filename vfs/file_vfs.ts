// Copyright 2021 Roy T. Hashimoto. All Rights Reserved.
import * as VFS from '../sqlite/VFS.ts';

// Memory filesystem. Although this is mainly provided as an example
// for new VFS classes, it seems to be faster than the default filesystem.
export class FileVFS extends VFS.Base {
  name = 'file';

  // Map of existing files, keyed by filename.
  mapNameToId = new Map<string, number>();

  // Map of open files, keyed by id (sqlite3_file pointer).
  mapIdToFile = new Map<number, Deno.FsFile>();
  prefix = `${Math.random().toFixed(6)}.db`;
  localOnly = new Set();

  constructor() {
    super();
  }

  private mustGetFile(fileId: number) {
    const file = this.mapIdToFile.get(fileId);
    if (!file) {
      throw new Error(`missing file for ${fileId}`);
    }
    return file;
  }

  close() {
    for (const fileId of this.mapIdToFile.keys()) {
      this.xClose(fileId);
    }
  }

  private correctName(name: string) {
    if (name.includes('wal') || name.includes('journal')) {
      return `${name}.${this.prefix}`;
    }
    return name;
  }

  xOpen(name: string, fileId: number, flags: number, pOutFlags: DataView) {
    // Generate a random name if requested.
    name = this.correctName(name);
    console.log('xOpen', name, fileId);
    if (!this.mapIdToFile.has(fileId)) {
      const file = Deno.openSync(name, {
        read: true, write: true, create: true,
      });
      this.mapIdToFile.set(fileId, file);
    }
    if (name.includes('wal') || name.includes('journal')) {
      this.localOnly.add(fileId);
    }
    pOutFlags.setInt32(0, flags, true);
    return VFS.SQLITE_OK;
  }

  xClose(fileId: number) {
    console.log('xClose', fileId);
    const file = this.mapIdToFile.get(fileId);
    if (file) {
      file.close();
      this.mapIdToFile.delete(fileId);
      for (const [name, id] of this.mapNameToId) {
        if (fileId == id) {
          this.mapNameToId.delete(name);
        }
      }
    }
    return VFS.SQLITE_OK;
  }

  xRead(fileId: number, pData: Uint8Array, iOffset: number) {
    return this.handleAsync(async () => {
      console.log('xRead', fileId, pData.byteLength, iOffset);
      const file = this.mustGetFile(fileId);
      const buffer = new Uint8Array(pData.byteLength);
      file.seekSync(iOffset, Deno.SeekMode.Start);
      const nBytesRead = await file.read(buffer) || 0;
      if (nBytesRead < pData.byteLength) {
        pData.fill(0, nBytesRead, pData.byteLength);
        console.log('>> xRead', fileId, 'short read');
        return VFS.SQLITE_IOERR_SHORT_READ;
      }
      pData.set(buffer);
      return VFS.SQLITE_OK;
    });
  }

  xWrite(fileId: number, pData: Uint8Array, iOffset: number) {
    return this.handleAsync(async () => {
      console.log('xWrite', fileId, pData.byteLength, iOffset);
      // if (!this.localOnly.has(fileId)) {
      //   const a = Math.random();
      //   if (a < 0.1) {
      //     // write failed
      //     console.log('xWrite', fileId, "failed");
      //     return VFS.SQLITE_IOERR_WRITE;
      //   }
      // }
      const file = this.mustGetFile(fileId);
      file.seekSync(iOffset, Deno.SeekMode.Start);
      const nwritten = await file.write(pData.slice());
      console.log('>> xWrite', fileId, nwritten);
      return VFS.SQLITE_OK;
    });
  }

  xTruncate(fileId: number, iSize: number) {
    console.log('xTruncate', fileId);
    const file = this.mustGetFile(fileId);
    file.truncateSync(iSize);
    return VFS.SQLITE_OK;
  }

  async xFileSize(fileId: number, pSize64: DataView) {
    console.log('xFileSize', fileId, pSize64);
    const file = this.mustGetFile(fileId);
    const size = file.statSync().size;
    pSize64.setBigInt64(0, BigInt(size), true);
    console.log('>> xFileSize', fileId, pSize64, size);
    return VFS.SQLITE_OK;
  }

  xDelete(name: string, syncDir: number) {
    name = this.correctName(name);
    console.log('xDelete', name, syncDir);
    Deno.removeSync(name);
    const fileId = this.mapNameToId.get(name);
    if (fileId) {
      this.mapNameToId.delete(name);
      this.mapIdToFile.delete(fileId);
    }
    return VFS.SQLITE_OK;
  }

  xAccess(name: string, flags: number, pResOut: DataView) {
    name = this.correctName(name);
    console.log('xAccess', name, flags);
    const fileId = this.mapNameToId.get(name);
    pResOut.setInt32(0, fileId ? 1 : 0, true);
    return VFS.SQLITE_OK;
  }
}
