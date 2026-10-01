package com.enfec.asset.exception;

public class DuplicateAssetTagException extends RuntimeException {
    public DuplicateAssetTagException(String assetTag) {
        super("Asset tag already exists: " + assetTag);
    }
}
