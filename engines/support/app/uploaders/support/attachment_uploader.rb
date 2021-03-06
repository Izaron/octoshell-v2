# encoding: utf-8

module Support
  class AttachmentUploader < CarrierWave::Uploader::Base
    #include CarrierWave::MimeTypes
    include CarrierWave::Compatibility::Paperclip
    CarrierWave::SanitizedFile.sanitize_regexp = /[^a-zA-Zа-яА-ЯёЁ0-9\.\-\+_]/u
    prepend FileTranslit
    storage :file

    # Override the directory where uploaded files will be stored.
    # This is a sensible default for uploaders that are meant to be mounted:
    def store_dir
      #logger.info "path=uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
      "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    end
  end
end
