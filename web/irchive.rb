require 'builder'
require 'couchrest'
require 'sinatra'

## index #####################################################################

get '/' do
  haml :index
end

get '/css/screen' do
  content_type 'text/css'
  sass :irchive
end

## activity ##################################################################

get %r{/channels/(.*?)/activity.json} do
  headers['Cache-Control'] = 'public, max-age=5'
  content_type 'application/javascript', :charset => 'utf-8'
  channel = params[:captures].first
  activity_by(:channel, channel, 30, params[:since]).to_json
end

get %r{/search/(.*?)/activity.json} do
  headers['Cache-Control'] = 'public, max-age=5'
  content_type 'application/javascript', :charset => 'utf-8'
  term  = params[:captures].first
  activity_by(:term, term, 30, params[:since]).to_json
end

## message ###################################################################

get '/messages/:id.html' do
  headers['Cache-Control'] = 'public, max-age=3600'
  params[:message] = message(params[:id])
  haml "messages/#{params[:message][:type]}".to_sym
end

## channels ##################################################################

get '/channels.json' do
  content_type 'application/javascript', :charset => 'utf-8'
  channels.to_json
end

## helpers ###################################################################

def database
  @database ||= CouchRest.database('http://127.0.0.1:5984/irchive')
end

def activity_by(type, value, limit, since=nil)
  startkey  = [value, {}]
  endkey    = since ? [value, since] : [value]

  result = database.view("activity/by_#{type}",
    :startkey   => startkey,
    :endkey     => endkey,
    :descending => 'true',
    :limit      => limit
  )

  result['rows'].pop if since

  result['rows'].map do |row|
    row['value']
  end
end

def channels
  database.view("channels/all", :group => true)['rows'].map do |row|
    row['key']
  end.sort
end

def format_message(message)
  message = CGI::escapeHTML(message)
  message = message.gsub(%r{https?://([-\w\.]+)+(:\d+)?(/([\w/_\-\%\.]*(\?\S+)?)?)?}) do |url|
    %{ <a href="#{url}" rel="nofollow">#{url}</a> }
  end
end

def message(id)
  database.get(id)
end
