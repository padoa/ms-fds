enum FdsTestFiles {
  // Images
  IMAGE_ARGON = 'IMAGE_ARGON',

  // Pdfs
  PDF_JEFFACLEAN = 'PDF_JEFFACLEAN',
}

export const FDS_TEST_FILES_PATH: { [fdsTestFile in FdsTestFiles]: string } = Object.freeze({
  [FdsTestFiles.IMAGE_ARGON]: 'resources/test-files/images/image-argon.pdf',
  [FdsTestFiles.PDF_JEFFACLEAN]: 'resources/test-files/pdfs/pdf-jeffaclean.pdf',
});
