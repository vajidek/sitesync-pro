import { formsRepository, CreateFormDto, SubmitFormDto } from '../repositories/forms.repository';

export class FormsService {
  async getForms(moduleCode?: string, search?: string) {
    return formsRepository.getForms(moduleCode, search);
  }

  async getFormById(id: string) {
    return formsRepository.getFormById(id);
  }

  async createForm(data: CreateFormDto) {
    return formsRepository.createForm(data);
  }

  async publishForm(id: string) {
    return formsRepository.publishForm(id);
  }

  async getSubmissions(formId?: string, projectId?: string) {
    return formsRepository.getSubmissions(formId, projectId);
  }

  async submitForm(data: SubmitFormDto) {
    return formsRepository.submitForm(data);
  }
}

export const formsService = new FormsService();
