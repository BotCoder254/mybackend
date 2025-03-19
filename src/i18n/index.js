import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      database: {
        title: 'Database Management',
        schema: 'Schema',
        newDocument: 'New Document',
        editDocument: 'Edit Document',
        deleteDocument: 'Delete Document',
        save: 'Save',
        cancel: 'Cancel',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        confirmDelete: 'Are you sure you want to delete this document?',
        noDocuments: 'No documents found',
        addField: 'Add Field',
        fieldName: 'Field Name',
        fieldType: 'Field Type',
        required: 'Required',
        optional: 'Optional',
        text: 'Text',
        number: 'Number',
        date: 'Date',
        boolean: 'Boolean',
        array: 'Array',
        object: 'Object',
        file: 'File'
      },
      settings: {
        title: 'UI Settings',
        theme: 'Theme',
        themeDescription: 'Choose between light and dark mode',
        layout: 'Layout',
        layoutDescription: 'Customize the overall layout of the application',
        layoutDefault: 'Default',
        layoutCompact: 'Compact',
        layoutSpacious: 'Spacious'
      }
    }
  },
  es: {
    translation: {
      database: {
        title: 'Gestión de Base de Datos',
        schema: 'Esquema',
        newDocument: 'Nuevo Documento',
        editDocument: 'Editar Documento',
        deleteDocument: 'Eliminar Documento',
        save: 'Guardar',
        cancel: 'Cancelar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        confirmDelete: '¿Está seguro de que desea eliminar este documento?',
        noDocuments: 'No se encontraron documentos',
        addField: 'Agregar Campo',
        fieldName: 'Nombre del Campo',
        fieldType: 'Tipo de Campo',
        required: 'Requerido',
        optional: 'Opcional',
        text: 'Texto',
        number: 'Número',
        date: 'Fecha',
        boolean: 'Booleano',
        array: 'Array',
        object: 'Objeto',
        file: 'Archivo'
      },
      settings: {
        title: 'Configuración de UI',
        theme: 'Tema',
        themeDescription: 'Elegir entre modo claro y oscuro',
        layout: 'Diseño',
        layoutDescription: 'Personalizar el diseño general de la aplicación',
        layoutDefault: 'Predeterminado',
        layoutCompact: 'Compacto',
        layoutSpacious: 'Espacioso'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 