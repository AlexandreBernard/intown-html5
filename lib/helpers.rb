module Helpers
  
  def javascripts(device)
    str = ''
    
    unless development?
      str += '<script type="text/javascript" src="/javascripts/'+ device.device[:package] +'.js"></script>'
    else
      device.javascripts.each do |file|
        str += '<script type="text/javascript" src="/javascripts/'+ file +'.js"></script>'
      end
      
      str += templates
    end
    
    str
  end
  
  def stylesheet_with_ratio(file)
    str = '<script type="text/javascript"> '
    str += "var ratio = window.devicePixelRatio; if(!ratio || ratio > 2){ ratio=2; } "
    str += 'var ss=document.createElement("link"); ss.type="text/css"; ss.rel="stylesheet"; ss.href="/stylesheets/'+ file.gsub('_x1', '') +'_x"+ ratio +".css"; document.getElementsByTagName("head")[0].appendChild(ss); </script>'
    str += '</script>'
  end
  
  def stylesheets(device)
    unless development?
      str = stylesheet_with_ratio(device.device[:package])
    else
      str = "<link rel='stylesheet' type='text/css' href='/stylesheets/#{device.stylesheet}.css' />"
      str += stylesheet_with_ratio(device.image_stylesheet)
    end
  end
  
  def templates
    str = '<script type="text/javascript">'
    
    templates = {}
    Dir.new("#{settings.root}/templates").each do |file|
      if file.include?('.slim')
        templates[file.to_s.gsub('.slim', '')] = Slim::Template.new("#{settings.root}/templates/#{file}").render
      end
    end
    str += "var Templates = #{templates.to_json};"
    
    str += '</script>'
  end
  
  def env_settings(device)
    vars = {}
    
    if defined?(LAT) && defined?(LNG) && LAT.to_s != '' && LNG.to_s != ''
      vars[:position] = { latitude: LAT, longitude: LNG }
    end
    
    fixes = '';
    
    if device.device[:os] == 'Windows Phone'
      fixes << 'window.devicePixelRatio=1.5; '
    end
    
    device = @device.device
    device[:version] = @device.major_version
    device[:browser] = @device.browser
    
    '<script type="text/javascript"> Env='+ (vars.to_json) +'; Env.device='+ (device.to_json) +'; '+ fixes +'</script>'
  end
  
  def store_file(datas, basename)
    Dir.mkdir "#{settings.root}/tmp" unless Dir.exists? "#{settings.root}/tmp"
    tmp_filename = "#{settings.root}/tmp/#{Process.pid}_#{basename}_#{Time.now.getutc.to_i}_#{datas[:filename]}"
    File.open(tmp_filename, 'w') { |f| f.write(open(datas[:tempfile]).read) }
    File.new(tmp_filename, 'r')
  end
  
end