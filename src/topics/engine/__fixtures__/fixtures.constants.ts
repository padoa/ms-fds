//----------------------------------------------------------------------------------------------
//----------------------------------------- BOX -----------------------------------------------
//----------------------------------------------------------------------------------------------

export const PAGE_NUMBER = 1;
export const POSITION_PROPORTION_X = 0.12;
export const POSITION_PROPORTION_Y = 0.12;
export const INCREMENT_VALUE = 0.03;

//----------------------------------------------------------------------------------------------
//----------------------------------------- PAGE_DIMENSION -------------------------------------
//----------------------------------------------------------------------------------------------

export const PAGE_WIDTH = 32;
export const PAGE_HEIGHT = 55;

//----------------------------------------------------------------------------------------------
//----------------------------------------- BASICS ---------------------------------------------
//----------------------------------------------------------------------------------------------

export const SPACE_TEXT = ' ';

export const RAW_TEXT_CONTENT = 'CONTENT';
export const CLEAN_TEXT_CONTENT = RAW_TEXT_CONTENT.toLowerCase();

export const RAW_PLACEHOLDER_TEXT_1 = 'Abc';
export const RAW_PLACEHOLDER_TEXT_2 = 'Def';
export const RAW_PLACEHOLDER_TEXT_3 = 'Ghi';
export const CLEAN_PLACEHOLDER_TEXT_1 = RAW_PLACEHOLDER_TEXT_1.toLowerCase();
export const CLEAN_PLACEHOLDER_TEXT_2 = RAW_PLACEHOLDER_TEXT_2.toLowerCase();
export const CLEAN_PLACEHOLDER_TEXT_3 = RAW_PLACEHOLDER_TEXT_3.toLowerCase();

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCT_NAME ---------------------------------------
//----------------------------------------------------------------------------------------------

export const RAW_PRODUCT_IDENTIFIER_WITH_COLON = ' Blabla Nom du produit : ';
export const RAW_PRODUCT_IDENTIFIER = ' Blabla: Nom du produit';
export const RAW_PRODUCT_NAME = 'JEFFACLEAN';
export const CLEAN_PRODUCT_IDENTIFIER_WITH_COLON = RAW_PRODUCT_IDENTIFIER_WITH_COLON.toLowerCase();
export const CLEAN_PRODUCT_IDENTIFIER = RAW_PRODUCT_IDENTIFIER.toLowerCase();
export const CLEAN_PRODUCT_NAME = RAW_PRODUCT_NAME.toLowerCase();

//----------------------------------------------------------------------------------------------
//----------------------------------------- PRODUCER -------------------------------------------
//----------------------------------------------------------------------------------------------

export const PRODUCER_IDENTIFIER_WITH_COLON = ' blabla 1.3 fournisseur : ';
export const PRODUCER_IDENTIFIER = ' blabla 1.3 fournisseur ';
export const PRODUCER_NAME = 'padoa';
export const PRODUCER_NAME_WITH_DOT = `${PRODUCER_NAME}.rc`;
export const PRODUCER_NAME_ENDING_WITH_DOT = `${PRODUCER_NAME}.`;

//----------------------------------------------------------------------------------------------
//----------------------------------------- DANGERS --------------------------------------------
//----------------------------------------------------------------------------------------------

export const H_DANGER = 'h350i';
export const H_DANGER_WITH_DETAILS = `${H_DANGER} - peut provoquer le cancer`;
export const EUH_DANGER = 'euh212';
export const P_DANGER = 'p 331';
export const P_DANGER_WITH_DETAILS = `${P_DANGER} - peut provoquer la mort`;
export const MULTIPLE_P_DANGER = 'p301 + p310';
export const MULTIPLE_P_DANGER_WITH_DETAILS = `${MULTIPLE_P_DANGER} - peut provoquer des douleurs`;

//----------------------------------------------------------------------------------------------
//----------------------------------------- SUBSTANCES -----------------------------------------
//----------------------------------------------------------------------------------------------

export const CAS_NUMBER = '64742-52-5';
export const CAS_NUMBER_TEXT = `cas : ${CAS_NUMBER}`;
export const CE_NUMBER = '265-155-0';
export const CE_NUMBER_TEXT = `ce : ${CE_NUMBER}`;

export const CONCENTRATION_VALUE = '>30 - <60';

//----------------------------------------------------------------------------------------------
//----------------------------------------- PHYSICAL_STATE -------------------------------------
//----------------------------------------------------------------------------------------------

export const RAW_PHYSICAL_STATE_IDENTIFIER = 'État Physique';
export const RAW_PHYSICAL_STATE_VALUE = 'Liquide';
export const CLEAN_PHYSICAL_STATE_IDENTIFIER = RAW_PHYSICAL_STATE_IDENTIFIER.toLowerCase();
export const CLEAN_PHYSICAL_STATE_VALUE = RAW_PHYSICAL_STATE_VALUE.toLowerCase();

//----------------------------------------------------------------------------------------------
//----------------------------------------- VAPOR_PRESSURE -------------------------------------
//----------------------------------------------------------------------------------------------

export const VAPOR_PRESSURE_TEMPERATURE = '50°c';
export const VAPOR_PRESSURE_IDENTIFIER = 'pression de vapeur';
export const VAPOR_PRESSURE_IDENTIFIER_WITH_TEMPERATURE = `${VAPOR_PRESSURE_IDENTIFIER} (${VAPOR_PRESSURE_TEMPERATURE})`;
export const VAPOR_PRESSURE_VALUE = '3 bar';

//----------------------------------------------------------------------------------------------
//----------------------------------------- BOILING_POINT --------------------------------------
//----------------------------------------------------------------------------------------------

export const BOILING_POINT_IDENTIFIER = 'ébullition';
export const BOILING_POINT_VALUE = '120 °c';
