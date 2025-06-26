// DTO para ProducerProfile
export class ProducerProfileDTO {
  constructor(profile) {
    this.id = profile.id;
    this.usuario_id = profile.usuario_id;
    this.PRODUCTOR_ID = profile.usuario_id; // Alias for test compatibility
    this.nombre_negocio = profile.nombre_negocio;
    this.ubicacion = profile.ubicacion;
    this.bio = profile.bio;
    this.telefono = profile.telefono;
    this.whatsapp = profile.whatsapp;
    this.facebook_url = profile.facebook_url;
    this.instagram_url = profile.instagram_url;
    this.tiktok_url = profile.tiktok_url;
    this.sitio_web = profile.sitio_web;
    this.logo_url = profile.logo_url;
    this.verificado = profile.verificado;
    this.activo = profile.activo;
    this.created_at = profile.created_at;
    this.updated_at = profile.updated_at;
  }
}
