// Copyright 2021 Roy T. Hashimoto. All Rights Reserved.
import * as VFS from '../sqlite/VFS.ts';


const trace = (...args: any[]) => {};

// Memory filesystem. Although this is mainly provided as an example
// for new VFS classes, it seems to be faster than the default filesystem.
export class MemoryVFS extends VFS.Base {
  name = 'memory';

  // Map of existing files, keyed by filename.
  mapNameToFile = new Map();

  // Map of open files, keyed by id (sqlite3_file pointer).
  mapIdToFile = new Map();

  constructor() {
    super();
  }

  close() {
    for (const fileId of this.mapIdToFile.keys()) {
      this.xClose(fileId);
    }
  }

  xOpen(name: string, fileId: number, flags: number, pOutFlags: DataView) {
    trace('xOpen', name, fileId);
    // Generate a random name if requested.
    name = name || Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
    let file = this.mapNameToFile.get(name);
    if (!file) {
      if (flags & VFS.SQLITE_OPEN_CREATE) {
        // Create a new file object.
        file = {
          name,
          flags,
          size: 0,
          data: new ArrayBuffer(0)
        };
        this.mapNameToFile.set(name, file);
      } else {
        return VFS.SQLITE_CANTOPEN;
      }
    }

    // Put the file in the opened files map.
    this.mapIdToFile.set(fileId, file);
    pOutFlags.setInt32(0, flags, true);
    return VFS.SQLITE_OK;
  }

  xClose(fileId: number) {
    trace('xClose', fileId);
    const file = this.mapIdToFile.get(fileId);
    this.mapIdToFile.delete(fileId);

    if (file.flags & VFS.SQLITE_OPEN_DELETEONCLOSE) {
      this.mapNameToFile.delete(file.name);
    }
    return VFS.SQLITE_OK;
  }

  async xRead(fileId: number, pData: Uint8Array, iOffset: number) {
    trace('xRead', fileId, pData.byteLength, iOffset);
    const file = this.mapIdToFile.get(fileId);

    // Clip the requested read to the file boundary.
    const bgn = Math.min(iOffset, file.size);
    const end = Math.min(iOffset + pData.byteLength, file.size);
    const nBytes = end - bgn;

    if (nBytes) {
      pData.set(new Uint8Array(file.data, bgn, nBytes));
    }

    if (nBytes < pData.byteLength) {
      // Zero unused area of read buffer.
      trace('>> xRead', fileId, 'short read');
      pData.fill(0, nBytes);
      return VFS.SQLITE_IOERR_SHORT_READ;
    }
    return VFS.SQLITE_OK;
  }

  async xWrite(fileId: number, pData: Uint8Array, iOffset: number) {
    const file = this.mapIdToFile.get(fileId);
    if (iOffset + pData.byteLength > file.data.byteLength) {
      // Resize the ArrayBuffer to hold more data.
      const newSize = Math.max(iOffset + pData.byteLength, 2 * file.data.byteLength);
      const data = new ArrayBuffer(newSize);
      new Uint8Array(data).set(new Uint8Array(file.data, 0, file.size));
      file.data = data;
    }

    // Copy data.
    new Uint8Array(file.data, iOffset, pData.byteLength).set(pData);
    file.size = Math.max(file.size, iOffset + pData.byteLength);
    return VFS.SQLITE_OK;
  }

  xTruncate(fileId: number, iSize: number) {
    trace('xTruncate', fileId);
    const file = this.mapIdToFile.get(fileId);

    // For simplicity we don't make the ArrayBuffer smaller.
    file.size = Math.min(file.size, iSize);
    return VFS.SQLITE_OK;
  }

  async xFileSize(fileId: number, pSize64: DataView) {
    trace('xFileSize', fileId, pSize64);
    const file = this.mapIdToFile.get(fileId);

    pSize64.setBigInt64(0, BigInt(file.size), true);
    trace('>> xFileSize', fileId, pSize64, file.size);
    return VFS.SQLITE_OK;
  }

  xDelete(name: string, syncDir: number) {
    trace('xDelete', name, syncDir);
    this.mapNameToFile.delete(name);
    return VFS.SQLITE_OK;
  }

  xAccess(name: string, flags: number, pResOut: DataView) {
    trace('xAccess', name, flags);
    const file = this.mapNameToFile.get(name);
    pResOut.setInt32(0, file ? 1 : 0, true);
    return VFS.SQLITE_OK;
  }
}
