#! /usr/bin/ruby

ROOT = File.dirname(__FILE__)

require 'bundler'
Bundler.require
require 'json'
require "#{ROOT}/lib/console_helpers"

class Deploy
  include ConsoleHelpers
  
  def initialize
    out ""
    out "Executing tasks...", 2
    
    set_env
    
    create_tree
    set_release_path
    clone_app
    #build_app rewrite this later
    set_new_release
    clean_old_releases
    kill_connections
    
    out ""
    out green('Done.'), 3
  end
  
  private
  
  def set_env
    begin
      @env = ARGV[0]
      
      if File.exists?("#{ROOT}/deploy_#{@env}.rb")
        require "#{ROOT}/deploy_#{@env}"
      else
        out red("Invalid environment."), 2
        abort
      end
      
      out "> Set environment to #{@env}"
    rescue
      out red("Choose a valid environment."), 2
      abort
    end
  end
  
  def create_tree
    ['releases'].each do |folder|
      unless ssh_exists?("#{SSH_ROOT}/#{folder}")
        out "> Create folder #{folder}"
        ssh_exec("mkdir #{SSH_ROOT}/#{folder}")
      end
    end
  end
  
  def set_release_path
    @release_path = "#{SSH_ROOT}/releases/#{Time.now.strftime('%Y-%m-%d-%H-%M-%S')}"
    out "> Deploy to #{@release_path}"
  end
  
  def clone_app
    out "> Cloning from #{REPOSITORY}"
    ssh_exec "git clone --recursive #{REPOSITORY} #{@release_path}"
    ssh_exec "cd #{@release_path} && rm -rf .git"
  end
  
  def build_app
    # we should play bundle update
    
    out "> Compiling application..."
    # bad
    out ssh_exec("cd #{@release_path} && /usr/local/rvm/rubies/ruby-1.9.3-p194/bin/ruby build.rb")
    
    out "> Remove javascript sources"
    ssh_exec "mv #{@release_path}/app/javascripts #{@release_path}/app/tmp_js"
    ssh_exec "mkdir #{@release_path}/app/javascripts"
    ssh_exec "mv #{@release_path}/app/tmp_js/app.js #{@release_path}/app/javascripts/app.js"
    ssh_exec "rm -rf #{@release_path}/app/tmp_js"
    
    out "> Remove css sources"
    ssh_exec "mv #{@release_path}/app/stylesheets #{@release_path}/app/tmp_css"
    ssh_exec "mkdir #{@release_path}/app/stylesheets"
    ssh_exec "mv #{@release_path}/app/tmp_css/app_x1.css #{@release_path}/app/stylesheets/app_x1.css"
    ssh_exec "mv #{@release_path}/app/tmp_css/app_x1.5.css #{@release_path}/app/stylesheets/app_x1.5.css"
    ssh_exec "mv #{@release_path}/app/tmp_css/app_x2.css #{@release_path}/app/stylesheets/app_x2.css"
    ssh_exec "rm -rf #{@release_path}/app/tmp_css"
  end
  
  def set_new_release
    out "> Define new release as current"
    
    if ssh_exec("cd #{SSH_ROOT}/current", :silent => true)
      ssh_exec "rm #{SSH_ROOT}/current"
    end
    ssh_exec "ln -s #{@release_path} #{SSH_ROOT}/current"
  end
  
  def clean_old_releases
    out "> Cleaning old releases... ", 1
    
    releases = {}
    dates = []
    sftp.dir.foreach(SSH_ROOT + '/releases') do |entry|
      unless %w(. ..).include?(entry.name)
        releases['release_'+entry.attributes.attributes[:mtime].to_s] = entry
        dates.push(entry.attributes.attributes[:mtime])
      end
    end
    
    counter = 0
    if releases.size > 10
      dates.sort.reverse.each_with_index do |date, index|
        if index > 10
          out "  Deleting #{SSH_ROOT}/releases/#{releases['release_'+date.to_s].name}... ", 0
          ssh_exec "rm -rf #{SSH_ROOT}/releases/#{releases['release_'+date.to_s].name}"
          puts green("done")
          counter += 1
        end
      end
    end
    
    out green("  #{counter} out of #{releases.size} deleted")
  end
  
  def ssh
    @ssh ||= Net::SSH.start SSH_HOST, SSH_USER, :port => SSH_PORT, :password => SSH_PASSWORD
  end
  
  def sftp
    @sftp ||= Net::SFTP.start SSH_HOST, SSH_USER, :port => SSH_PORT, :password => SSH_PASSWORD
  end
  
  def ssh_exec(command, options = {})
    response = ""
    ssh.exec! command do |ch, stream, data|
      if stream == :stderr
        error(data, false) if options[:silent].nil?
        response = false
      else
        response.to_s << data.to_s
      end
    end
    response
  end
  
  def ssh_exists?(file)
    filename = file.split('/').last
    sftp.dir.glob(file.gsub("/#{filename}", ''), filename) do |entry|
      return true
    end
    false
  end
  
  def ssh_cake_exec(command, options = {})
    command = @config[@environment]['cake_shell_prefix'].nil? ? command : "#{@config[@environment]['cake_shell_prefix']} && cd #{@release_path} && ./cake/console/cake #{command}"
    ssh_exec command, options
  end
  
  def kill_connections
    out "> Kill connections"
    ssh.close if @ssh
    sftp.close_channel if @sftp
  end
  
end

Deploy.new
