class MobileDevice
  
  attr_accessor :devices
  
  def initialize(agent)
    @agent = (agent || '').downcase
    
    @devices = {
      iphone:   { type: 'mobile', device: 'iPhone', os: 'iOS', package: 'app.min' },
      ipad:     { type: 'tablet', device: 'iPad', os: 'iOS', package: 'app.min' },
      android:  { type: 'mobile', device: 'generic', os: 'Android', package: 'app.min' },
      winphone: { type: 'mobile', device: 'generic', os: 'Windows Phone', package: 'app.min' },
      blackberry:  { type: 'mobile', device: 'generic', os: 'BlackBerry', package: 'app.min' },
      chrome:   { type: 'desktop', device: 'generic', os: 'desktop', package: 'app.min' },
      safari:   { type: 'desktop', device: 'generic', os: 'desktop', package: 'app.min' },
      generic:  { type: 'generic', device: 'generic', os: 'generic', package: 'app.min' }
    }
  end
  
  def detect_device
    if /iphone/.match(@agent)
      @device_name = :iphone
    elsif /ipad/.match(@agent)
      @device_name = :ipad
    elsif /blackberry/.match(@agent)
      @device_name = :blackberry
    elsif /android/.match(@agent)
      @device_name = :android
    elsif /iemobile/.match(@agent)
      @device_name = :winphone
    elsif /chrome/.match(@agent)
      @device_name = :chrome
    elsif /safari/.match(@agent)
      @device_name = :safari
    else
      @device_name = :generic
    end
    
    @devices[@device_name]
  end
  
  def version
    case @device_name
    when :iphone
      @agent.match("iphone os ([0-9\_]+)")[1].gsub('_', '.')
    when :ipad
      @agent.match("os ([0-9\_]+)")[1].gsub('_', '.')
    when :android
      @agent.match("android ([0-9\.\_]+)")[1].gsub('_', '.')
    when :winphone
      @agent.match("iemobile/([0-9\.]+)")[1]
    when :blackberry
      @agent.match("version/([0-9\.]+)")[1]
    when :chrome
      @agent.match("chrome\/([0-9\.]+)")[1]
    when :safari
      @agent.match("version/([0-9\.]+)")[1]
    end
  end
  
  def major_version
    case @device_name
    when :iphone
      @agent.match("iphone os ([0-9])")[1].to_i
    when :ipad
      @agent.match("os ([0-9])")[1].to_i
    when :android
      @agent.match("android ([0-9\.\_]{3})")[1].gsub('_', '.').to_f
    when :winphone
      @agent.match("iemobile/([0-9]+)")[1].to_i
    when :blackberry
      @agent.match("version/([0-9]+)")[1].to_i
    when :chrome
      @agent.match("chrome\/([0-9]+)")[1].to_i
    when :safari
      @agent.match("version/([0-9]+)")[1].to_i
    end
  end
  
  def browser
    case @device_name
    when :iphone
      :safari
    when :ipad
      :safari
    when :android
      if /chrome/.match(@agent)
        :chrome
      else
        :android_browser
      end
    when :winphone
      :ie
    when :blackberry
      :blackberry_browser
    when :chrome
      :chrome
    when :safari
      :safari
    else
      :generic
    end
  end
  
  def set_device(name)
    @device = @devices[name.to_sym]
    @device_name = name.to_sym
  end
  
  def device
    @device ||= detect_device
  end
  
  def supported?
    if %(generic BlackBerry).include?(device[:os])
      false
    else
      case @device_name
      when :iphone
        major_version >= 4
      when :ipad
        major_version >= 4
      when :android
        major_version >= 2.0
      when :winphone
        major_version >= 9 # IE9 not WP9
      when :chrome
        true
      when :safari
        true
      end
    end
  end
  
  def javascripts
    js = []
    
    if device[:os] == 'Windows Phone'
      ['jquery-1.7.2', 'underscore-1.3.1', 'backbone-0.9.2', 'ie.scrolltop', 'jquery.placeholder-2.0.7'].each do |file|
        js << "alexbmobile/lib/#{file}"
      end
    else
      ['zepto-0.8', 'underscore-1.3.1', 'backbone-0.9.2', 'zepto.clone', 'zepto.scrolltop', 'hoover'].each do |file|
        js << "alexbmobile/lib/#{file}"
      end
    end
    
    if device[:os] == 'Android'
      js << "alexbmobile/src/ext/iso_date_parser" << "mobiscroll/mobiscroll.zepto-2.0.3" << "mobiscroll/mobiscroll.core-2.0.3-custom" << "mobiscroll/mobiscroll.android-ics-2.0" << "mobiscroll/mobiscroll.datetime-2.0.3"
    end
    
    if device[:os] == 'Windows Phone'
      js << "alexbmobile/src/jquery_fixes"
    end
    
    js << "routes" << "app" << "application.api" << "application.auth"
    
    framework = ["support", "plugins/link", "Nav", "Ui", "Backbone.history-ext", "Backbone.view.ext", "Animation"]
    
    if device[:os] == 'Windows Phone'
      framework << "Animation.oldschool" << "simulate_fixed" << "plugins/dateInput" << "windows_phone_fixes"
    else
      framework << "Animation.webkit"
    end
    
    framework.each do |file|
      js << "alexbmobile/src/#{file}"
    end
    
    ['invitation', 'schedule', 'behaviors/place_selector'].each do |view|
      js << "views/#{view}"
    end
    
    js
  end
  
  def stylesheet
    "app"
  end
  
  def image_stylesheet
    "images_x1"
  end
  
end