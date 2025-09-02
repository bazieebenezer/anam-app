import { Injectable } from '@angular/core';
import { WeatherBulletin } from 'src/app/model/bulletin.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileOpener } from '@capacitor-community/file-opener';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  constructor(
    private toastController: ToastController,
    private datePipe: DatePipe
  ) {}

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
      const formattedCreatedAt = this.datePipe.transform(
        (bulletin.createdAt as any).toDate(),
        'fullDate',
        undefined,
        'fr-FR'
      );
      const formattedEndDate = this.datePipe.transform(
        bulletin.endDate,
        'fullDate',
        undefined,
        'fr-FR'
      );

      pdfContainer.innerHTML = `
        <div style="width: 210mm; padding: 12mm; font-family: Arial, sans-serif; color: #222; background-color: #fff; box-sizing: border-box;">

  <!-- En-tête -->
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ddd; padding-bottom: 6mm;">
    <img src="assets/logo/anam_logo.png" style="width: 40mm;">
    <h1 style="font-size: 20px; font-weight: bold; text-align: right; margin: 0; color: #333;">${
      bulletin.title
    }</h1>
  </div>

  <!-- Image principale -->
  <div style="margin-top: 10mm; text-align: center;">
    <img src="${
      bulletin.images[0]
    }" style="width: 85%; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
  </div>

  <!-- Dates -->
  <div style="margin-top: 8mm; font-size: 14px; color: #555;">
    <p style="margin: 4px 0;">📅 <strong>Publié le :</strong> ${formattedCreatedAt}</p>
    <p style="margin: 4px 0;">⏳ <strong>Valable jusqu'au :</strong> ${formattedEndDate}</p>
  </div>

  <!-- Description -->
  <div style="margin-top: 12mm;">
    <h3 style="font-size: 16px; color: #444; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Description</h3>
    <p style="text-align: justify; line-height: 1.5; margin: 6px 0;">${
      bulletin.description
    }</p>
  </div>

  <!-- Conseils pratiques -->
  <div style="margin-top: 12mm;">
    <h3 style="font-size: 16px; color: #444; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Conseils pratiques</h3>
    <ul style="color: #333; padding-left: 18px; margin: 6px 0; line-height: 1.6;">
      ${bulletin.tips
        .map((tip) => `<li style="margin-bottom: 4px;">${tip}</li>`)
        .join('')}
    </ul>
  </div>

  <!-- Criticité + Spécificité -->
  <div style="margin-top: 12mm; display: flex; justify-content: center; padding: 8px; border: 1px solid #ddd; border-radius: 6px; background: #f9f9f9;">
    <div>
      <span style="font-weight: bold;">⚠ Criticité :</span>
      <span style="color: ${severityColor}; font-weight: bold; text-transform: uppercase;">${
        bulletin.severity
      }</span>
    </div>
    ${
      bulletin.targetInstitutionId
        ? `
    <div>
      <span style="font-weight: bold;">🏛 Spécificité :</span>
      <span>Spécifique</span>
    </div>`
        : ''
    }
  </div>

  <!-- Images secondaires -->
  <div style="margin-top: 14mm;">
    <h3 style="font-size: 16px; color: #444; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 3px;">Images</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px;">
      ${bulletin.images
        .slice(1)
        .map(
          (image) =>
            `<img src="${image}" style="width: 47%; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.2);">`
        )
        .join('')}
    </div>
  </div>

</div>


      `;
      document.body.appendChild(pdfContainer);

      const images = Array.from(pdfContainer.getElementsByTagName('img'));
      const imagePromises = images.map(img => {
        // For already cached images, the 'load' event might not fire.
        // Setting the src again triggers it.
        // See: https://html.spec.whatwg.org/multipage/images.html#updating-the-image-data
        if (img.complete) {
          return Promise.resolve();
        }
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Could not load image: ' + img.src));
          // In case the image is already loaded but not 'complete'
          if (img.naturalWidth > 0) {
            resolve();
          }
        });
      });

      await Promise.all(imagePromises);

      const canvas = await html2canvas(
        pdfContainer.children[0] as HTMLElement,
        {
          useCORS: true,
          scale: 2,
          // Allow tainted canvases to capture cross-origin images
          allowTaint: true,
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

      const fileName = `bulletin du ${formattedCreatedAt}.pdf`;

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
