xml.activities do
  params[:activity].each do |activity|
    xml.activity do
      activity.each do |key, value|
        xml.tag!(key, value)
      end
    end
  end
end