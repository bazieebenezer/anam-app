import { Injectable } from '@angular/core';
import { WeatherBulletin } from 'src/app/model/bulletin.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileOpener } from '@capacitor-community/file-opener';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  constructor(private toastController: ToastController) {}

  private getSeverityColor(severity: 'urgent' | 'eleve' | 'normal'): string {
    switch (severity) {
      case 'urgent':
        return 'red';
      case 'eleve':
        return 'orange';
      case 'normal':
        return 'green';
      default:
        return 'black';
    }
  }

  async generateBulletinPdf(bulletin: WeatherBulletin) {
    const loadingToast = await this.toastController.create({
      message: 'Téléchargement...',
      duration: 0,
      color: 'primary',
    });
    await loadingToast.present();

    try {
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      const severityColor = this.getSeverityColor(bulletin.severity);
      pdfContainer.innerHTML = `
        <div style="width: 210mm; padding: 10mm; font-family: sans-serif; color: black; background-color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <img src="assets/logo/anam_logo.png" style="width: 40mm;">
            <h1 style="font-size: 18px;">${bulletin.title}</h1>
          </div>
          <div style="margin-top: 10mm;">
            <img src="${
              bulletin.images[0]
            }" style="width: 80%; margin: 0 auto; display: block;">
          </div>
          <p>Publié le <p/><span>${bulletin.createdAt}<span/>
          <p>Valable jusqu'au <p/><span>${bulletin.endDate}<span/>
          <div style="margin-top: 10mm;">
            <p>${bulletin.description}</p>
          </div>
          <div style="margin-top: 10mm;">
            <h3>Conseils pratiques</h3>
            <ul>
              ${bulletin.tips.map((tip) => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
          <div style="margin-top: 10mm; display: flex; justify-content: space-around;">
              <div>
                  <span>Criticité:</span>
                  <span style="color: ${severityColor}; font-weight: bold;">${
        bulletin.severity
      }</span>
              </div>
              ${
                bulletin.targetInstitutionId
                  ? `
              <div>
                  <span>Spécificité:</span>
                  <span>Spécifique</span>
              </div>`
                  : ''
              }
          </div>
          <div style="margin-top: 10mm;">
              <h3>Galerie d'images</h3>
              <div style="display: flex; flex-wrap: wrap;">
                  ${bulletin.images
                    .slice(1)
                    .map(
                      (image) =>
                        `<img src="${image}" style="width: 45%; margin: 2.5%;">`
                    )
                    .join('')}
              </div>
          </div>
        </div>

      `;
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(
        pdfContainer.children[0] as HTMLElement,
        {
          useCORS: true,
          scale: 2,
        }
      );

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const imgHeight = canvasHeight / ratio;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `bulletin-${bulletin.id}.pdf`;

      if (Capacitor.isNativePlatform()) {
        const pdfData = pdf.output('datauristring');
        const result = await Filesystem.writeFile({
          path: fileName,
          data: pdfData,
          directory: Directory.Cache,
        });

        await FileOpener.open({
          filePath: result.uri,
          contentType: 'application/pdf',
        });
      } else {
        pdf.save(fileName);
      }

      await loadingToast.dismiss();
      const successToast = await this.toastController.create({
        message: 'Téléchargement terminé',
        duration: 2000,
        color: 'success',
      });
      await successToast.present();
    } catch (error) {
      await loadingToast.dismiss();
      const errorToast = await this.toastController.create({
        message: 'Erreur lors du téléchargement du PDF.',
        duration: 2000,
        color: 'danger',
      });
      await errorToast.present();
      console.error(error);
    }
  }
}
