ROOT = File.dirname(__FILE__)

require 'bundler'
Bundler.require
require 'json'
require "#{ROOT}/lib/console_helpers"
require "#{ROOT}/lib/mobile_device"

class Compiler
  include ConsoleHelpers
  
  def initialize
    out ""
    
    @device = MobileDevice.new nil
    
    if ARGV.size > 0 && %(javascripts stylesheets check_javascripts).include?(ARGV[0])
      send(ARGV[0])
    else
      javascripts
      stylesheets
    end
    
    out ""
  end
  
  def javascripts
    built = []
    @device.devices.each_pair do |name, device|
      if !built.include?(device[:package])
        out "Compiling #{device[:package]}.js javascript package."
        
        @device.set_device(name)
        javascript_package(device[:package])
        
        built << device[:package]
      end
    end
  end
  
  def javascript_package(name)
    files = @device.javascripts
    out " -> #{files.size} files... "
    
    code = ""
    size = 0
    files.each do |file|
      file = File.open("#{ROOT}/public/javascripts/#{file}.js", 'r')
      size += file.size
      code << file.read + "\n\n"
    end
    
    # add templates in package
    templates = {}
    html_compressor = HtmlCompressor::HtmlCompressor.new
    
    Dir.new("#{ROOT}/templates").each do |file|
      if file.include?('.slim')
        html = Slim::Template.new("#{ROOT}/templates/#{file}").render
        templates[file.to_s.gsub('.slim', '')] = html_compressor.compress(html)
      end
    end
    tpl_code = "var Templates = #{templates.to_json};\n\n"
    code << tpl_code
    
    # get additional size from templates
    tpl_file = File.open("#{ROOT}/templates/templates.tmp", "w")
    tpl_file.write(tpl_code)
    size += tpl_file.size
    `rm #{ROOT}/templates/templates.tmp`
    
    size = size / 1024
    out " -> #{yellow(size.to_s+'ko')} packaged... "
    
    minified = Closure::Compiler.new.compile(code)
    
    packfile = File.open("#{ROOT}/public/javascripts/#{name}.js", "w")
    packfile.write(minified)
    
    newsize = packfile.size / 1024
    out " -> #{yellow(newsize.to_s+'ko')} compressed... "
    
    `gzip -f #{ROOT}/public/javascripts/#{name}.js`
    gzipfile = File.open("#{ROOT}/public/javascripts/#{name}.js.gz", "r")
    gzipsize = gzipfile.size / 1024
    out " -> #{yellow(gzipsize.to_s+'ko')} gzipped. "
    `rm #{ROOT}/public/javascripts/#{name}.js.gz`
    
    # write again as gzip removes original
    packfile = File.open("#{ROOT}/public/javascripts/#{name}.js", "w")
    packfile.write(minified)
    
    out green('done'), 2
  end
  
  def stylesheets
    formats = {
      'x1'    => 'only screen and (-webkit-device-pixel-ratio: 1)',
      'x1.5'  => 'only screen and (-webkit-device-pixel-ratio: 1.5)',
      'x2'    => 'only screen and (-webkit-device-pixel-ratio: 2)'
    }
    
    built = []
    @device.devices.each_pair do |name, device|
      if !built.include?(device[:package])
        @device.set_device(name)
        formats.each_pair do |format, query|
          stylesheet(device[:package], format, query)
        end
        
        built << device[:package]
      end
    end
  end
  
  def check_javascripts
    built = []
    checked = []
    @device.devices.each_pair do |name, device|
      if !built.include?(device[:package])
        @device.set_device(name)
        @device.javascripts.each do |js|
          unless checked.include?(js)
            out "Compiling #{js}.js... ", 0
            Closure::Compiler.new.compile File.open("#{ROOT}/public/javascripts/#{js}.js", 'r').read
            puts green('OK')
            checked << js
          end
        end
        
        built << device[:package]
      end
    end
  end
  
  def stylesheet(name, format, query)
    out "Compiling #{name}_#{format}.css..."
    
    code = ""
    size = 0
    
    css = `lessc #{ROOT}/views/less/#{@device.stylesheet}.less`
    
    file = File.open("#{ROOT}/public/stylesheets/tmp_#{@device.stylesheet}.css", "w")
    file.write(css)
    size += file.size
    
    file.close
    
    `rm #{ROOT}/public/stylesheets/tmp_#{@device.stylesheet}.css`
    
    images = check_images(css, @device.stylesheet)
    if images.size > 0
      out red(" -> #{images.size} images in #{filename}.css. Should be moved to image stylesheets!")
    end
      
    code << css + "\n\n"
    
    basename = @device.image_stylesheet.gsub('_x1', '')
    images_to_base64 "#{basename}_#{format}"
    file = File.open("#{ROOT}/public/stylesheets/#{basename}_#{format}_base64.css", 'r')
    size += file.size
    code << file.read + "\n\n"
    `rm #{ROOT}/public/stylesheets/#{basename}_#{format}_base64.css`
  
    size = size / 1024
    
    out " -> #{yellow(size.to_s+'ko')} packaged... "
    
    compressor = YUI::CssCompressor.new
    minified = compressor.compress(code)
    
    packfile = File.open("#{ROOT}/public/stylesheets/#{name}_#{format}.css", "w")
    packfile.write(minified)
    
    newsize = packfile.size / 1024
    out " -> #{yellow(newsize.to_s+'ko')} compressed... "
    
    `gzip -f #{ROOT}/public/stylesheets/#{name}_#{format}.css`
    gzipfile = File.open("#{ROOT}/public/stylesheets/#{name}_#{format}.css.gz", "r")
    gzipsize = gzipfile.size / 1024
    out " -> #{yellow(gzipsize.to_s+'ko')} gzipped. "
    `rm #{ROOT}/public/stylesheets/#{name}_#{format}.css.gz`
    
    # write again as gzip removes original
    packfile = File.open("#{ROOT}/public/stylesheets/#{name}_#{format}.css", "w")
    packfile.write(minified)
    
    out green('done'), 2
  end
  
  def images_to_base64(file)
    if File.exists? "#{ROOT}/views/less/#{file}.less"
      css = `lessc #{ROOT}/views/less/#{file}.less`
    else
      css = File.open("#{ROOT}/public/stylesheets/#{file}.css", "r").read
    end
    
    mimes = {
      'png' => 'image/png',
      'jpg' => 'image/jpeg',
      'gif' => 'image/gif'
    }
    
    images = check_images(css, file)
    images.each do |image|
      encoded = `base64 #{ROOT}/public#{image}`
      ext = image.split('.').last
      
      css = css.gsub(image, "data:#{mimes[ext]};base64,#{encoded.gsub(' ', '').gsub("\n", '')}")
    end
    
    file = File.open("#{ROOT}/public/stylesheets/#{file}_base64.css", "w")
    file.write(css)
    file.close
  end
  
  def check_images(css, file)
    images = []
    css.scan(/url[\s]*\([\s]*(?<url>[^\)]*)\)/).each do |image|
      if images.include?(image[0])
        out red(" -> Many occurences of #{image[0]} in #{file}.css")
      else
        images.push(image[0])
      end
    end
    
    images
  end
  
end

Compiler.new
