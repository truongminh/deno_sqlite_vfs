// Copyright 2022 Roy T. Hashimoto. All Rights Reserved.
import * as VFS from './sqlite-constants.ts';
export * from './sqlite-constants.ts';

// Base class for a VFS.
export class Base {
  mxPathName = 64;

  xClose(fileId: number) {
    return VFS.SQLITE_IOERR;
  }

  async xRead(fileId: number, pData: Uint8Array, iOffset: number) {
    return VFS.SQLITE_IOERR;
  }

  async xWrite(fileId: number, pData: Uint8Array, iOffset: number) {
    return VFS.SQLITE_IOERR;
  }

  xTruncate(fileId: number, iSize: number) {
    return VFS.SQLITE_IOERR;
  }

  xSync(fileId: number, flags: any) {
    return VFS.SQLITE_OK;
  }

  xFileSize(fileId: number, pSize64: DataView) {
    return VFS.SQLITE_IOERR;
  }

  xLock(fileId: number, flags: number) {
    return VFS.SQLITE_OK;
  }

  xUnlock(fileId: number, flags: number) {
    return VFS.SQLITE_OK;
  }

  xCheckReservedLock(fileId: number, pResOut: DataView) {
    pResOut.setInt32(0, 0, true);
    return VFS.SQLITE_OK;
  }

  xFileControl(fileId: number, op: number, pArg: DataView) {
    return VFS.SQLITE_NOTFOUND;
  }

  xSectorSize(fileId: number) {
    return 512;
  }

  xDeviceCharacteristics(fileId: number) {
    return 0;
  }

  /**
   * @param {string?} name 
   * @param {number} fileId 
   * @param {number} flags 
   * @param {DataView} pOutFlags 
   * @returns {number}
   */
  xOpen(name: string = '', fileId: number, flags: number, pOutFlags: DataView) {
    return VFS.SQLITE_CANTOPEN;
  }

  xDelete(name: string, syncDir: number) {
    return VFS.SQLITE_IOERR;
  }

  xAccess(name: string, flags: number, pResOut: DataView) {
    return VFS.SQLITE_IOERR;
  }

  handleAsync(f: () => Promise<number>) {
    return f();
  }
}

export const FILE_TYPE_MASK = [
  VFS.SQLITE_OPEN_MAIN_DB,
  VFS.SQLITE_OPEN_MAIN_JOURNAL,
  VFS.SQLITE_OPEN_TEMP_DB,
  VFS.SQLITE_OPEN_TEMP_JOURNAL,
  VFS.SQLITE_OPEN_TRANSIENT_DB,
  VFS.SQLITE_OPEN_SUBJOURNAL,
  VFS.SQLITE_OPEN_SUPER_JOURNAL
].reduce((mask, element) => mask | element);