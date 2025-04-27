declare module 'html2pdf.js' {
    function html2pdf(): {
      from: (element: HTMLElement) => any;
      set: (options: any) => any;
      save: () => Promise<void>;
      saveAs: (filename: string) => Promise<void>;
    };
    
    export = html2pdf;
  }