enum FdsTestFiles {
  // Images
  IMAGE_DEGRAISSANT = 'IMAGE_DEGRAISSANT',

  // Pdfs
  PDF_JEFFACLEAN = 'PDF_JEFFACLEAN',
}

export const FDS_TEST_FILES_PATH: { [fdsTestFile in FdsTestFiles]: string } = Object.freeze({
  [FdsTestFiles.IMAGE_DEGRAISSANT]: 'resources/test-files/images/image-degraissant.pdf',
  [FdsTestFiles.PDF_JEFFACLEAN]: 'resources/test-files/pdfs/pdf-jeffaclean.pdf',
});
