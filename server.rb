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

def locale
  params['locale'] || 'fr'
end

def user_agent
  "HTML5 -- #{request.user_agent}"
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
  url = "#{API_URL}#{params['url']}"
  
  case params['method']
  when "post"
    api_request = RestClient.post(url, params['data'], accept: :json, 'Accept-Language' => locale, user_agent: user_agent) do |response, request, result|
      halt 201, { 'Content-Type' => 'application/json' }, { code: response.code, data: json_response(response) }.to_json
    end
  when "put"
    api_request = RestClient.put(url, params['data'], accept: :json, 'Accept-Language' => locale, user_agent: user_agent) do |response, request, result|
      halt 201, { 'Content-Type' => 'application/json' }, ({ code: response.code, data: json_response(response) }.to_json rescue {}.to_json)
    end
  when "delete"
    api_request = RestClient.delete(url, accept: :json, 'Accept-Language' => locale, user_agent: user_agent) do |response, request, result|
      halt 201, { 'Content-Type' => 'application/json' }, ({ code: response.code, data: json_response(response) }.to_json rescue {}.to_json)
    end
  else
    api_request = RestClient.get(url, accept: :json, 'Accept-Language' => locale, user_agent: user_agent) do |response, request, result, &block|
      if [301, 302, 307].include? response.code
        response.follow_redirection(request, result, &block)
      else
        halt 200, { 'Content-Type' => 'application/json' }, { code: response.code, data: json_response(response) }.to_json
      end
    end
  end
end

not_found do
  # maybe not the best thing to do. to be improved.
  redirect to('/')
end
