require 'bundler'
Bundler.require
require 'sinatra'
require 'json'
require "#{settings.root}/lib/mobile_device"
require "#{settings.root}/lib/helpers"

helpers Helpers
include Helpers

configure do
  require "#{settings.root}/environments/#{settings.environment}"
end

set :protection, except: :frame_options

def set_device
  @device = MobileDevice.new request.user_agent
  @view_file = :unsupported unless @device.supported?
end

def json_response(response)
  JSON.parse(response.to_s) rescue {}
end

get '/' do
  set_device
  slim @view_file || :index
end

if settings.environment.to_s == 'development'
  get %r{/stylesheets/([a-z0-9\.\_]+)\.css} do
    less "less/#{params[:captures].first}".to_sym, paths: ["#{settings.root}/less"]
  end
end

post '/api' do
  # block requests from another host maybe?
  puts params.inspect
  url = "http://intown.hostedby.risen.be/#{params['url']}"
  
  case params['method']
  when "put"
    api_request = RestClient.put(url, params['data'] || {}, accept: :json) do |response, request, result|
      halt 201, { 'Content-Type' => 'application/json' }, ({ code: response.code, data: json_response(response) }.to_json rescue {}.to_json)
    end
  else
    api_request = RestClient.get(url, accept: :json) do |response, request, result, &block|
      halt 200, { 'Content-Type' => 'application/json' }, { code: response.code, data: json_response(response) }.to_json
    end
  end
end

not_found do
  # maybe not the best thing to do. to be improved.
  redirect to('/')
end
